export type KuboAddResponse = {
  Bytes: number;
  Hash: string;
  Mode: string;
  Mtime: number;
  MtimeNsecs: number;
  Name: string;
  Size: string;
};

export type RemoteQueue = {
    id: number;
    cid: string;
    rules: string;
    created_at: string;
}
