const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        bio: '博主',
        role: 'admin'
      }
    });
    console.log('默认管理员账号已创建: admin / admin123');
  } else {
    console.log('用户表已有数据，跳过种子数据');
  }
}

main()
  .catch((e) => {
    console.error('种子数据执行失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
