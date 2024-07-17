const { Level } = require('level');

// データベースを作成または開く
const db = new Level('./mydb', { valueEncoding: 'json' });

async function runExample() {
  try {
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
      console.log(`${key}:${value}`);
    }

    // データの削除
    await db.del('user:3');

    // 削除されたデータの確認
    try {
      await db.get('user:3');
    } catch (error) {
      console.log('User 3 does not exist');
    }
  } catch (error) {
    console.error(error)
  } finally {
    await db.close()
  }
}

runExample();
