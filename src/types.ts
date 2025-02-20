export type KuboAddResponse = {
  Bytes: number;
  Hash: string;
  Mode: string;
  Mtime: number;
  MtimeNsecs: number;
  Name: string;
  Size: string;
};

export type PinningService = {
  name: string;
  endpoint: string;
  key: string;
}
