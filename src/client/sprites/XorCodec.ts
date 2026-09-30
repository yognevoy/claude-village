export class XorCodec {
  public constructor(private readonly key: Uint8Array) {}

  public apply(data: Uint8Array): Uint8Array {
    const output = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
      output[i] = (data[i] as number) ^ (this.key[i % this.key.length] as number);
    }
    return output;
  }
}
