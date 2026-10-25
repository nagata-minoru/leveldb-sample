const { Level } = require('level');

// 渡された DB で一連の操作を実演する
const runExample = async (db) => {
  // データの追加
  await db.put('user:1', { name: 'John', age: 30 });
  await db.put('user:2', { name: 'Bob', age: 25 });
  await db.put('user:3', { name: 'Alice', age: 35 });

  // データの取得
  const user1 = await db.get('user:1');
  console.log('User 1:', user1);

  // データの更新
  await db.put('user:1', { name: 'Mari', age: 26 });

  // 範囲クエリ
  console.log('All users:');
  for await (const [key, value] of db.iterator({ gte: 'user:', lte: 'user:\xff' })) {
    console.log(`${key}:${JSON.stringify(value)}`);
  }

  // データの削除
  await db.del('user:3');

  // 削除されたデータの確認
  // level 10 では存在しないキーは例外ではなく undefined が返る
  const user3 = await db.get('user:3');
  if (user3 === undefined) {
    console.log('User 3 does not exist');
  }
};

const main = async () => {
  // データベースを作成または開く
  const db = new Level('./mydb', { valueEncoding: 'json' });
  try {
    await runExample(db);
  } catch (error) {
    console.error(error)
  } finally {
    await db.close()
  }
};

if (require.main === module) {
  main();
}

module.exports = { runExample };
