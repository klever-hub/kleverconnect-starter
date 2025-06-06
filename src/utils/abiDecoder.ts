import { abiDecoder } from '@klever/sdk-web';

export interface DecodedValue {
  type: string;
  value: unknown;
  raw: string;
}

export interface DecodedReturnData {
  values: DecodedValue[];
  raw: string[];
}

export interface ABIType {
  name?: string;
  type: string;
  fields?: Array<{ name: string; type: string }>;
  variants?: Array<{ name: string; discriminant: number }>;
}

export interface ABIEndpoint {
  name: string;
  mutability?: 'readonly' | 'mutable';
  outputs?: Array<{ type: string; name?: string }>;
}

export interface ContractABI {
  endpoints: ABIEndpoint[];
  types?: Record<string, ABIType>;
}

const decode = (abi: string | ContractABI, hexValue: string, endpoint: string): DecodedValue => {
  if (endpoint === '') {
    throw new Error('Invalid endpoint provided');
  }

  if (!abi || abi === undefined || abi === '' || abi === '{}') {
    throw new Error('Invalid ABI');
  }

  let abiString: string;
  let abiJson: ContractABI;

  if (typeof abi === 'string') {
    abiString = abi;
    try {
      abiJson = JSON.parse(abi);
    } catch (error) {
      console.error('Failed to parse ABI JSON:', error);
      throw new Error('Invalid ABI JSON format');
    }
  } else {
    abiJson = abi;
    abiString = JSON.stringify(abi);
  }

  if (!abiJson.endpoints) {
    throw new Error('Invalid ABI');
  }

  const endpointDef = abiJson.endpoints.find((t: { name: string }) => t.name === endpoint);
  if (!endpointDef) {
    throw new Error('Invalid endpoint');
  }

  if (!endpointDef.outputs || endpointDef.outputs.length === 0) {
    throw new Error('Invalid output length');
  }

  if (endpointDef.outputs.length !== 1) {
    throw new Error('Invalid output length');
  }

  const type = endpointDef.outputs[0].type;

  const value = selectDecode(abiString, abiJson, hexValue, type);

  return {
    type,
    value,
    raw: hexValue,
  };
};

const decodeBaseValue = (hexValue: string, type: string): unknown => {
  switch (type) {
    case 'BigUint': {
      const value = abiDecoder.decodeValue(hexValue, type);
      return value !== undefined ? Number(value) : hexValue; // Fallback to hexValue if decoding fails
    }
    case 'BigInt': {
      const value = abiDecoder.decodeValue(hexValue, type);
      return value !== undefined ? Number(value) : hexValue; // Fallback to hexValue if decoding fails
    }
    default:
      return abiDecoder.decodeValue(hexValue, type) || hexValue; // Fallback to abiDecoder for other types
  }
};

const selectDecode = (
  abi: string,
  abiJSON: ContractABI,
  hexValue: string,
  type: string
): unknown => {
  if (type.startsWith('tuple<')) {
    type = type.slice(6, -1);
    return decodeTuple(abiJSON, hexValue, type);
  }

  if (type.startsWith('variadic<')) {
    type = type.slice(9, -1);
    return selectDecode(abi, abiJSON, hexValue, type);
  }

  if (type.startsWith('List<')) {
    type = type.slice(5, -1);
    return abiDecoder.decodeList(hexValue, type, abi);
  }

  if (!abiJSON.types) {
    return decodeBaseValue(hexValue, type);
  }

  const abiType = abiJSON.types[type];
  if (!abiType) {
    return decodeBaseValue(hexValue, type);
  }

  if (abiType.type === 'struct') {
    return abiDecoder.decodeStruct(hexValue, type, abi);
  }

  throw new Error(`Invalid type: ${type}`);
};

export const decodeTuple = (
  abiJSON: ContractABI,
  hexValue: string,
  type: string
): unknown => {
  const types = type.split(",");

  if (!abiJSON.types) {
    abiJSON["types"] = {};
  }

  abiJSON.types["generated_custom_type"] = generateTupleType(types);

  return abiDecoder.decodeStruct(
    hexValue,
    "generated_custom_type",
    JSON.stringify(abiJSON)
  );
};

const generateTupleType = (types: string[]): ABIType => {
  const tupleType: ABIType = {
    type: "struct",
    fields: [],
  };

  types.map((type, index) => {
    tupleType.fields!.push({ name: `_${index}`, type });
  });

  return tupleType;
};

/**
 * Decodes multiple return values from a smart contract based on ABI
 */
export function decodeReturnData(
  hexValues: string[],
  endpoint: ABIEndpoint,
  abi: string | ContractABI
): DecodedReturnData {
  switch (hexValues.length) {
    case 0:
      return { values: [], raw: [] };
    case 1: {
      const result = decode(abi, hexValues[0], endpoint.name);
      return {
        values: [result],
        raw: hexValues,
      };
    }
    default:
      // not supported yet
      return { values: [], raw: [] };
  }
}

/**
 * Extracts return data from transaction logs
 */
export function extractReturnDataFromLogs(logs: unknown): string[] | null {
  try {
    // Check if logs have the expected structure
    if (!logs || typeof logs !== 'object') return null;

    const logsObj = logs as {
      events?: Array<{ identifier?: string; topics?: string[]; data?: string | string[] }>;
    };

    if (!logsObj.events || !Array.isArray(logsObj.events)) return null;

    // Look for ReturnData event
    const returnDataEvent = logsObj.events.find((event) => event.identifier === 'ReturnData');

    if (!returnDataEvent) return null;

    // Extract data from the data field
    const returnValues: string[] = [];

    // The data field contains the return values
    if (returnDataEvent.data) {
      if (Array.isArray(returnDataEvent.data)) {
        // Data is already an array
        returnValues.push(...returnDataEvent.data.filter((d) => d !== ''));
      } else if (typeof returnDataEvent.data === 'string' && returnDataEvent.data !== '') {
        // Data is a single string
        returnValues.push(returnDataEvent.data);
      }
    }

    // Also check topics in case data is stored there (some contracts might use topics)
    if (returnDataEvent.topics && returnDataEvent.topics.length > 0) {
      // Filter out empty topics
      const nonEmptyTopics = returnDataEvent.topics.filter((t) => t !== '');
      if (nonEmptyTopics.length > 0 && returnValues.length === 0) {
        // Only use topics if we didn't find data in the data field
        returnValues.push(...nonEmptyTopics);
      }
    }

    return returnValues.length > 0 ? returnValues : null;
  } catch (error) {
    console.error('Failed to extract return data from logs:', error);
    return null;
  }
}

/**
 * Decodes transaction results including return values
 */
export function decodeTransactionResults(
  results: unknown,
  functionName: string,
  abi?: ContractABI
): { decoded: DecodedReturnData | null; raw: unknown } {
  try {
    // Extract logs from results
    const resultsObj = results as { logs?: unknown };
    if (!resultsObj.logs) {
      return { decoded: null, raw: results };
    }

    // Extract return data from logs
    const returnData = extractReturnDataFromLogs(resultsObj.logs);
    if (!returnData || returnData.length === 0) {
      return { decoded: null, raw: results };
    }

    // If we have ABI, decode the return values
    if (abi) {
      const endpoint = abi.endpoints.find((ep) => ep.name === functionName);
      if (endpoint) {
        const decoded = decodeReturnData(returnData, endpoint, abi);
        return { decoded, raw: results };
      }
    }

    // Without ABI, return raw hex values
    return {
      decoded: {
        values: returnData.map((hex) => ({
          type: 'unknown',
          value: hex,
          raw: hex,
        })),
        raw: returnData,
      },
      raw: results,
    };
  } catch (error) {
    console.error('Failed to decode transaction results:', error);
    return { decoded: null, raw: results };
  }
}
