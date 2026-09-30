import assert from "node:assert/strict";
import { test } from "node:test";
import { XorCodec } from "../src/client/sprites/XorCodec.js";

test("apply is self-inverse for the same key", () => {
  const codec = new XorCodec(new Uint8Array([1, 2, 3]));
  const original = new Uint8Array([10, 20, 30, 40, 50]);
  const encoded = codec.apply(original);
  const decoded = codec.apply(encoded);
  assert.deepEqual(decoded, original);
});

test("apply changes the bytes for a non-zero key", () => {
  const codec = new XorCodec(new Uint8Array([255]));
  const original = new Uint8Array([0, 1, 2]);
  const encoded = codec.apply(original);
  assert.notDeepEqual(encoded, original);
});

test("apply repeats a shorter key across longer data", () => {
  const codec = new XorCodec(new Uint8Array([7]));
  const original = new Uint8Array([1, 2, 3]);
  const encoded = codec.apply(original);
  assert.deepEqual(encoded, new Uint8Array([1 ^ 7, 2 ^ 7, 3 ^ 7]));
});

test("apply on empty data returns empty data", () => {
  const codec = new XorCodec(new Uint8Array([1, 2, 3]));
  assert.deepEqual(codec.apply(new Uint8Array([])), new Uint8Array([]));
});
