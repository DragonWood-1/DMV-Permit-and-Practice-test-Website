import { PrismaClient } from '@prisma/client';
import { states } from '../src/data/states';
import { questions } from '../src/data/questions';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Seed States
  console.log(`Seeding ${states.length} states...`);
  for (const state of states) {
    await prisma.state.upsert({
      where: { slug: state.slug },
      update: {
        name: state.name,
        abbreviation: state.abbreviation,
        dmvUrl: state.dmvUrl,
        flagUrl: state.flagUrl,
      },
      create: {
        name: state.name,
        abbreviation: state.abbreviation,
        slug: state.slug,
        dmvUrl: state.dmvUrl,
        flagUrl: state.flagUrl,
      },
    });
  }
  console.log(`Seeded ${states.length} states.`);

  // Seed Questions
  console.log(`Seeding ${questions.length} questions...`);
  for (const question of questions) {
    await prisma.question.upsert({
      where: { id: question.id },
      update: {
        text: question.text,
        options: JSON.stringify(question.options),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        category: question.category,
        topic: question.topic,
        states: JSON.stringify(question.states),
        active: true,
      },
      create: {
        id: question.id,
        text: question.text,
        options: JSON.stringify(question.options),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        category: question.category,
        topic: question.topic,
        states: JSON.stringify(question.states),
        active: true,
      },
    });
  }
  console.log(`Seeded ${questions.length} questions.`);

  // Print summary
  const stateCount = await prisma.state.count();
  const questionCount = await prisma.question.count();
  const permitCount = await prisma.question.count({ where: { category: 'permit' } });
  const driversCount = await prisma.question.count({ where: { category: 'drivers' } });
  const motorcycleCount = await prisma.question.count({ where: { category: 'motorcycle' } });

  console.log('\nDatabase seed complete!');
  console.log('Summary:');
  console.log(`  States: ${stateCount}`);
  console.log(`  Total Questions: ${questionCount}`);
  console.log(`    - Permit: ${permitCount}`);
  console.log(`    - Drivers: ${driversCount}`);
  console.log(`    - Motorcycle: ${motorcycleCount}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
