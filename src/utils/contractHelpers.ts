import { abiEncoder } from "@klever/sdk-web";
import type { 
  EncodableParam,
  TypedContractParam,
  IAddress,
  IManagedBuffer,
  IBigUint,
  IBigInt,
  IOU64,
  IU64,
  IU32,
  II64,
  II32,
  IBool
} from "../types/contract";

/**
 * Base implementation for ABI encoding functionality
 */
function createAbiEncoder<T>(abiType: string, value: T): EncodableParam<T> {
  return {
    value,
    encode(): string {
      try {
        // check if it has options
        if (abiType.startsWith("Option:")) {
          // if value is null or undefined, return "00"
          if (value === null || value === undefined) {
            return "00";
          }
          // if value is not null or undefined, encode it
          // and prepend "01" to indicate presence
          const abiTypeWithoutOption = abiType.replace("Option:", "");
          const result = abiEncoder.encodeABIValue(value, abiTypeWithoutOption, true);
          return "01" + result;
        }
        return abiEncoder.encodeABIValue(value, abiType, false);
      } catch (error) {
        console.error(`Error encoding ${abiType}:`, error);
        throw new Error(`Failed to encode ${abiType} value: ${value}`);
      }
    },
    encodeBase64(): string {
      const hexString = this.encode();
      const bytes = hexString.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      const uint8Array = new Uint8Array(bytes);
      const binaryString = Array.from(uint8Array)
        .map(byte => String.fromCharCode(byte))
        .join('');
      return btoa(binaryString);
    }
  };
}

/**
 * Helper functions to create properly typed contract parameters
 */
export const contractParam = {
  address: (value: string): IAddress => {
    if (!value.startsWith('klv1')) {
      throw new Error(`Value is not a valid Klever address: ${value}`);
    }
    return {
      ...createAbiEncoder("Address", value),
      abiType: "Address"
    };
  },
  
  optionalAddress: (value?: string): IAddress | null => {
    return value ? contractParam.address(value) : null;
  },
  
  buffer: (value: string): IManagedBuffer => {
    return {
      ...createAbiEncoder("ManagedBuffer", value),
      abiType: "ManagedBuffer"
    };
  },
  
  bufferFromHex: (value: string): IManagedBuffer => {
    // Convert the hex string to a byte array
    const bytes = value.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
    // Create a string that will encode back to the original hex
    const str = String.fromCharCode(...bytes);
    // Create a ManagedBuffer with this specially crafted string
    return {
      ...createAbiEncoder("ManagedBuffer", str),
      abiType: "ManagedBuffer"
    };
  },
  
  bufferFromBase64: (value: string): IManagedBuffer => {
    // Convert the base64 string to a byte array
    const binaryString = atob(value);
    // Create a ManagedBuffer with the decoded string
    return {
      ...createAbiEncoder("ManagedBuffer", binaryString),
      abiType: "ManagedBuffer"
    };
  },
  
  bigUint: (value: string | number): IBigUint => {
    const strValue = typeof value === 'number' ? value.toString() : value;
    if (!/^\d+$/.test(strValue)) {
      throw new Error(`Invalid BigUint value: ${strValue}`);
    }
    return {
      ...createAbiEncoder("BigUint", strValue),
      abiType: "BigUint"
    };
  },
  
  bigInt: (value: string | number): IBigInt => {
    const strValue = typeof value === 'number' ? value.toString() : value;
    if (!/^-?\d+$/.test(strValue)) {
      throw new Error(`Invalid BigInt value: ${strValue}`);
    }
    return {
      ...createAbiEncoder("BigInt", strValue),
      abiType: "BigInt"
    };
  },
  
  optionU64: (value?: number): IOU64 => {
    const finalValue = value ?? null;
    if (finalValue !== null && finalValue !== undefined) {
      if (isNaN(finalValue) || finalValue < 0 || finalValue > Number.MAX_SAFE_INTEGER) {
        throw new Error(`Invalid u64 value: ${finalValue}`);
      }
    }
    return {
      ...createAbiEncoder("Option:u64", finalValue),
      abiType: "Option:u64"
    };
  },
  
  u64: (value: number): IU64 => {
    if (isNaN(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Invalid u64 value: ${value}`);
    }
    return {
      ...createAbiEncoder("u64", value),
      abiType: "u64"
    };
  },
  
  u32: (value: number): IU32 => {
    if (isNaN(value) || value < 0 || value > 0xFFFFFFFF) {
      throw new Error(`Invalid u32 value: ${value}`);
    }
    return {
      ...createAbiEncoder("u32", value),
      abiType: "u32"
    };
  },
  
  i64: (value: number): II64 => {
    if (isNaN(value) || value < Number.MIN_SAFE_INTEGER || value > Number.MAX_SAFE_INTEGER) {
      throw new Error(`Invalid i64 value: ${value}`);
    }
    return {
      ...createAbiEncoder("i64", value),
      abiType: "i64"
    };
  },
  
  i32: (value: number): II32 => {
    if (isNaN(value) || value < -2147483648 || value > 2147483647) {
      throw new Error(`Invalid i32 value: ${value}`);
    }
    return {
      ...createAbiEncoder("i32", value),
      abiType: "i32"
    };
  },
  
  bool: (value: boolean): IBool => {
    return {
      ...createAbiEncoder("bool", value),
      abiType: "bool"
    };
  },
};

/**
 * Helper function to check if an argument is an encodable parameter
 */
export function isEncodableParam(arg: unknown): arg is EncodableParam<unknown> {
  return arg !== null && 
         typeof arg === 'object' && 
         'encode' in arg && 
         'encodeBase64' in arg &&
         typeof (arg as { encode?: unknown }).encode === 'function' &&
         typeof (arg as { encodeBase64?: unknown }).encodeBase64 === 'function';
}

/**
 * Helper function to convert TypedContractParam to EncodableParam
 */
export function convertTypedToEncodable(param: TypedContractParam): EncodableParam<unknown> {
  switch (param.type) {
    case 'Address':
      return contractParam.address(String(param.value));
    case 'ManagedBuffer':
      return contractParam.buffer(String(param.value));
    case 'BigUint':
      return contractParam.bigUint(String(param.value));
    case 'BigInt':
      return contractParam.bigInt(String(param.value));
    case 'u64':
      return contractParam.u64(Number(param.value));
    case 'u32':
      return contractParam.u32(Number(param.value));
    case 'i64':
      return contractParam.i64(Number(param.value));
    case 'i32':
      return contractParam.i32(Number(param.value));
    case 'bool':
      return contractParam.bool(Boolean(param.value));
    default:
      throw new Error(`Unsupported parameter type: ${param.type}`);
  }
}