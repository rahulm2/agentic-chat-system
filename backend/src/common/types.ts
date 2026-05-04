export interface SSEWriter {
  writeSSE(event: string, data: unknown): Promise<void>;
  close(): void;
}
