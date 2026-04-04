// tests/helpers.js — Lightweight expect() wrapper around node:assert/strict
// Provides jest/vitest-compatible API without external dependencies.

'use strict';

const assert = require('node:assert/strict');

function expect(actual) {
  return {
    toBe(expected) {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected) {
      assert.deepStrictEqual(actual, expected);
    },
    toHaveLength(expected) {
      assert.ok(
        actual != null && typeof actual.length === 'number',
        `Expected value to have a length property, got ${typeof actual}`
      );
      assert.strictEqual(actual.length, expected);
    },
    toBeTruthy() {
      assert.ok(actual);
    },
    toBeFalsy() {
      assert.ok(!actual);
    },
    toBeGreaterThan(expected) {
      assert.ok(actual > expected, `Expected ${actual} > ${expected}`);
    },
    toContain(expected) {
      if (typeof actual === 'string') {
        assert.ok(actual.includes(expected), `Expected string to contain "${expected}"`);
      } else if (Array.isArray(actual)) {
        assert.ok(actual.includes(expected), `Expected array to contain ${expected}`);
      } else {
        assert.fail(`toContain requires string or array, got ${typeof actual}`);
      }
    },
    toMatch(pattern) {
      assert.match(actual, pattern instanceof RegExp ? pattern : new RegExp(pattern));
    },
    toThrow(expected) {
      assert.throws(actual, expected);
    },
    not: {
      toBe(expected) {
        assert.notStrictEqual(actual, expected);
      },
      toEqual(expected) {
        assert.notDeepStrictEqual(actual, expected);
      },
      toContain(expected) {
        if (typeof actual === 'string') {
          assert.ok(!actual.includes(expected), `Expected string NOT to contain "${expected}"`);
        } else if (Array.isArray(actual)) {
          assert.ok(!actual.includes(expected), `Expected array NOT to contain ${expected}`);
        }
      },
      toBeTruthy() {
        assert.ok(!actual);
      },
    },
  };
}

module.exports = { expect };
