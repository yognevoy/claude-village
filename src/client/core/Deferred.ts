export class Deferred<T> {
  public readonly promise: Promise<T>;
  private _resolve: (value: T) => void = () => undefined;

  public constructor() {
    this.promise = new Promise<T>((resolve) => {
      this._resolve = resolve;
    });
  }

  public resolve(value: T): void {
    this._resolve(value);
  }
}
