// Contract parameter type definitions
export interface EncodableParam<T> {
  value: T;
  encode(): string;
  encodeBase64(): string;
}

export interface IAddress extends EncodableParam<string> {
  abiType: string;
}

export interface IManagedBuffer extends EncodableParam<string> {
  abiType: string;
}

export interface IBigUint extends EncodableParam<string> {
  abiType: string;
}

export interface IBigInt extends EncodableParam<string> {
  abiType: string;
}

export interface IOU64 extends EncodableParam<number | null> {
  abiType: string;
}

export interface IU64 extends EncodableParam<number> {
  abiType: string;
}

export interface IU32 extends EncodableParam<number> {
  abiType: string;
}

export interface II64 extends EncodableParam<number> {
  abiType: string;
}

export interface II32 extends EncodableParam<number> {
  abiType: string;
}

export interface IBool extends EncodableParam<boolean> {
  abiType: string;
}

export interface TypedContractParam {
  type: 'Address' | 'ManagedBuffer' | 'BigUint' | 'BigInt' | 'u64' | 'u32' | 'i64' | 'i32' | 'bool';
  value: string | number | boolean;
}