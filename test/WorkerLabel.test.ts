import { test } from "node:test";
import assert from "node:assert/strict";
import { WorkerLabel, type LabelElement } from "../src/client/world/WorkerLabel.js";

interface FakeElement extends LabelElement {
  removed: boolean;
}

function fakeElement(): FakeElement {
  return {
    textContent: null,
    style: { left: "", top: "", display: "" },
    removed: false,
    remove() {
      this.removed = true;
    },
  };
}

test("shows a name that fits the limit unchanged", () => {
  const element = fakeElement();
  const label = new WorkerLabel(element);

  label.update({ projectName: "village" });

  assert.equal(element.textContent, "village");
});

test("shows a name of exactly the limit length unchanged", () => {
  const element = fakeElement();
  const label = new WorkerLabel(element);

  label.update({ projectName: "abcdefghijkl" });

  assert.equal(element.textContent, "abcdefghijkl");
});

test("cuts a longer name to 12 characters with a trailing ellipsis", () => {
  const element = fakeElement();
  const label = new WorkerLabel(element);

  label.update({ projectName: "abcdefghijklmn" });

  assert.equal(element.textContent, "abcdefghijk…");
  assert.equal(element.textContent?.length, 12);
});

test("moveTo writes the point to the element as css pixels", () => {
  const element = fakeElement();
  const label = new WorkerLabel(element);

  label.moveTo({ x: 40.5, y: 12 });

  assert.equal(element.style.left, "40.5px");
  assert.equal(element.style.top, "12px");
});

test("destroy removes the element", () => {
  const element = fakeElement();
  const label = new WorkerLabel(element);

  label.destroy();

  assert.equal(element.removed, true);
});
