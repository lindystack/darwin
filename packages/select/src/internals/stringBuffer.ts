export class StringBuffer {
  private __strings__: string[] = [];

  public append(str: string): void {
    this.__strings__.push(str);
  }

  public toString(): string {
    return this.__strings__.join("");
  }
}
