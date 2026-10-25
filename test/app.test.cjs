const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { Level } = require('level');
const { runExample } = require('../app.cjs');

let dir;
let db;

beforeEach(async () => {
  // テストごとに一時ディレクトリへ新しい DB を作る
  dir = await fs.mkdtemp(path.join(os.tmpdir(), 'leveldb-sample-'));
  db = new Level(dir, { valueEncoding: 'json' });
});

afterEach(async () => {
  await db.close();
  await fs.rm(dir, { recursive: true, force: true });
});

test('実行後は user:1 が更新され、user:3 が削除されている', async (t) => {
  t.mock.method(console, 'log', () => {});
  await runExample(db);

  assert.deepEqual(await db.get('user:1'), { name: 'Mari', age: 26 });
  assert.deepEqual(await db.get('user:2'), { name: 'Bob', age: 25 });
  assert.equal(await db.get('user:3'), undefined);
});

test('取得・範囲クエリ・削除確認の結果を出力する', async (t) => {
  const log = t.mock.method(console, 'log', () => {});
  await runExample(db);

  const lines = log.mock.calls.map((call) => call.arguments);
  assert.deepEqual(lines[0], ['User 1:', { name: 'John', age: 30 }]);
  assert.deepEqual(lines[1], ['All users:']);
  // 範囲クエリはキー順に 3 件出力される
  assert.deepEqual(lines.slice(2, 5).map(([line]) => line.split(':', 2).join(':')), ['user:1', 'user:2', 'user:3']);
  assert.deepEqual(lines.at(-1), ['User 3 does not exist']);
});

test('範囲クエリは値を JSON で出力する', async (t) => {
  const log = t.mock.method(console, 'log', () => {});
  await runExample(db);

  const lines = log.mock.calls.map((call) => call.arguments);
  assert.deepEqual(lines.slice(2, 5), [
    ['user:1:{"name":"Mari","age":26}'],
    ['user:2:{"name":"Bob","age":25}'],
    ['user:3:{"name":"Alice","age":35}'],
  ]);
});

test('範囲クエリは user: 以外のキーを含まない', async (t) => {
  await db.put('admin:1', { name: 'Root' });
  await db.put('zzz', { name: 'Other' });
  const log = t.mock.method(console, 'log', () => {});
  await runExample(db);

  const keys = log.mock.calls.map((call) => call.arguments[0]).filter((line) => /^\w+:\d+:/.test(line));
  assert.deepEqual(keys.map((line) => line.split(':', 2).join(':')), ['user:1', 'user:2', 'user:3']);
});
