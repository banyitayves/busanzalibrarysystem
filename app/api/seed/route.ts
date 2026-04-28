import { NextRequest, NextResponse } from 'next/server';
import getPool from '@/lib/db';
import * as crypto from 'crypto';
import { initializeDatabase } from '@/lib/db-init';
import { readFileSync } from 'fs';
import { join } from 'path';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Past papers data
const PAST_PAPERS = [
  { title: '2014 General Paper All Combinations', path: '/past_papers/2014_General_Paper_All_Combinations__GE_.pdf', year: 2014 },
  { title: '2014 Kiswahili EKK', path: '/past_papers/2014_Kiswahili_EKK.pdf', year: 2014 },
  { title: '2014 Literature in English', path: '/past_papers/2014_Literature_in_English_HEL__LEG__HGL__EFK.pdf', year: 2014 },
  { title: '2016 Entrepreneurship II All Combinations', path: '/past_papers/2016_Entrepreneurship_II_All_Combinations__GE_.pdf', year: 2016 },
  { title: '2016 Ikinyarwanda II EFK EKK', path: '/past_papers/2016_Ikinyarwanda_II_EFK__EKK.pdf', year: 2016 },
  { title: '2016 Kiswahili EKK', path: '/past_papers/2016_Kiswahili_EKK.pdf', year: 2016 },
  { title: '2017 Ikinyarwanda II LFK LKK', path: '/past_papers/2017_Ikinyarwanda_II_LFK__LKK.pdf', year: 2017 },
  { title: '2017 Kiswahili EKK', path: '/past_papers/2017_Kiswahili_EKK.pdf', year: 2017 },
  { title: '2018 Ikinyarwanda II LFK LKK', path: '/past_papers/2018_Ikinyarwanda_II_LFK__LKK.pdf', year: 2018 },
  { title: '2018 Kiswahili LKK LKF', path: '/past_papers/2018_Kiswahili_LKK__LKF.pdf', year: 2018 },
  { title: '2019 Entrepreneurship II All Combinations', path: '/past_papers/2019_Entrepreneurship_II_All_Combinations.pdf', year: 2019 },
  { title: '2019 GS CS All Combinations', path: '/past_papers/2019_GS_CS_All_Combinations.pdf', year: 2019 },
  { title: '2019 Ikinyarwanda II LFK LKK', path: '/past_papers/2019_Ikinyarwanda_II_LFK__LKK.pdf', year: 2019 },
  { title: '2019 Kiswahili LKK LKF', path: '/past_papers/2019_Kiswahili_LKK__LKF.pdf', year: 2019 },
  { title: '2019 Literature in English', path: '/past_papers/2019_Literature_in_English_HEL__LEG__HGL__LFK__LKK.pdf', year: 2019 },
  { title: '2021 Entrepreneurship II All Combinations', path: '/past_papers/2021_Entrepreneurship_II_All_Combinations.pdf', year: 2021 },
  { title: '2021 Francais LFK EFK', path: '/past_papers/2021_Francais_LFK__EFK.pdf', year: 2021 },
  { title: '2021 General Studies and Communication Skills', path: '/past_papers/2021_General_Studies_and_Communication_Skills_All_Combinations.pdf', year: 2021 },
  { title: '2021 Ikinyarwanda II LFK LKK', path: '/past_papers/2021_Ikinyarwanda_II__LFK___LKK.pdf', year: 2021 },
  { title: '2021 Literature in English', path: '/past_papers/2021_Literature_in_English_HEL__LEG__HGL__LFK__LKK.pdf', year: 2021 },
  { title: '2022 Entrepreneurship II All combinations', path: '/past_papers/2022_Entrepreneurship_II_All_combinations.pdf', year: 2022 },
  { title: '2022 Francais LFK LKF', path: '/past_papers/2022_Francais_LFK___LKF.pdf', year: 2022 },
  { title: '2022 Gen. Studies Comm. Skills All combinations', path: '/past_papers/2022_Gen._Studies___Comm._Skills_All_combinations.pdf', year: 2022 },
  { title: '2022 Ikinyarwanda LFK LKK', path: '/past_papers/2022_Ikinyarwanda_LFK___LKK.pdf', year: 2022 },
  { title: '2022 Kiswahili LFK LKK', path: '/past_papers/2022_Kiswahili_LFK___LKK.pdf', year: 2022 },
  { title: '2022 Literature in English', path: '/past_papers/2022_Literature_in_English_HEG__HEL__HGL__LFK__LKK__LKF.pdf', year: 2022 },
  { title: '2023 Entrepreneurship II All combinations', path: '/past_papers/2023_Entrepreneurship_II_All_combinations.pdf', year: 2023 },
  { title: '2023 Francais LFK LKF', path: '/past_papers/2023_Francais_LFK___LKF.pdf', year: 2023 },
  { title: '2023 Gen. Studies Comm. Skills All combinations', path: '/past_papers/2023_Gen._Studies___Comm._Skills_All_combinations.pdf', year: 2023 },
  { title: '2023 Ikinyarwanda LFK LKK', path: '/past_papers/2023_Ikinyarwanda_LFK___LKK.pdf', year: 2023 },
  { title: '2023 Kiswahili LFK LKK', path: '/past_papers/2023_Kiswahili_LFK___LKK.pdf', year: 2023 },
  { title: '2023 Literature in English', path: '/past_papers/2023_Literature_in_English_HEG__HEL__HGL__LFK__LKK__LKF.pdf', year: 2023 },
  { title: '2024 Entrepreneurship II ALL Combination', path: '/past_papers/2024_Entrepreneurship_II_ALL_Combination.pdf', year: 2024 },
  { title: '2024 Francais LFK LKF', path: '/past_papers/2024_Francais_LFK_LKF.pdf', year: 2024 },
  { title: '2024 General Studies Communication Skills ALL Combination', path: '/past_papers/2024_General_Studies___Communication_Skills_ALL_Combination.pdf', year: 2024 },
  { title: '2024 Kinyarwanda LFK LKK', path: '/past_papers/2024_Kinyarwanda_LFK_LKK.pdf', year: 2024 },
  { title: '2024 Kiswahili LKK LKF', path: '/past_papers/2024_Kiswahili_LKK_LKF.pdf', year: 2024 },
  { title: '2024 Literature in english', path: '/past_papers/2024_Literature_in_english_HEL_LEG_HGL_LFK_LKK_LKF.pdf', year: 2024 },
  { title: '2025 AL GE Entrepreneurship II', path: '/past_papers/2025_AL_GE_Entrepreneurship_II.pdf', year: 2025 },
  { title: '2025 AL GE French', path: '/past_papers/2025_AL_GE_French.pdf', year: 2025 },
  { title: '2025 AL GE General Studies Communications Skills', path: '/past_papers/2025_AL_GE_General_Studies___Communications_Skills.pdf', year: 2025 },
  { title: '2025 AL GE Kinyarwanda II', path: '/past_papers/2025_AL_GE_Kinyarwanda_II.pdf', year: 2025 },
  { title: '2025 AL GE Kiswahili', path: '/past_papers/2025_AL_GE_Kiswahili.pdf', year: 2025 },
  { title: '2025 AL GE Literature in English', path: '/past_papers/2025_AL_GE_Literature_in_English.pdf', year: 2025 },
  { title: 'Agriculture S3 SB', path: '/past_papers/Agriculture_S3_SB.pdf', year: 2023 },
  { title: 'Agriculture S3 TG', path: '/past_papers/Agriculture_S3_TG.pdf', year: 2023 },
];

export async function POST(request: NextRequest) {
  let connection = null;

  try {
    await initializeDatabase();

    const pool = getPool();
    connection = await pool.getConnection();

    // Create test users if they don't exist
    const testUsers = [
      {
        username: 'student1',
        password: hashPassword('password123'),
        name: 'John Student',
        role: 'student',
        level: 'S6',
        class_name: 'S6 LFK',
      },
      {
        username: 'teacher1',
        password: hashPassword('password123'),
        name: 'Jane Teacher',
        role: 'teacher',
      },
      {
        username: 'librarian1',
        password: hashPassword('password123'),
        name: 'Admin Librarian',
        role: 'librarian',
      },
    ];

    for (const user of testUsers) {
      try {
        const [existing] = await connection.execute(
          'SELECT id FROM users WHERE username = ?',
          [user.username]
        );

        if ((existing as any[]).length === 0) {
          await connection.execute(
            `INSERT INTO users (username, password, name, role, level, class_name, is_active)
             VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
            [user.username, user.password, user.name, user.role, user.level || null, user.class_name || null]
          );
        }
      } catch (err) {
        console.error(`Error creating user ${user.username}:`, err);
      }
    }

    // Get librarian user for seeding papers
    const [librarians] = await connection.execute(
      'SELECT id FROM users WHERE role = ? LIMIT 1',
      ['librarian']
    );

    const librarianId = (librarians as any[])[0]?.id || 1;

    // Add past papers as books
    let addedCount = 0;
    for (const paper of PAST_PAPERS) {
      try {
        const [existing] = await connection.execute(
          'SELECT id FROM books WHERE title = ?',
          [paper.title]
        );

        if ((existing as any[]).length === 0) {
          await connection.execute(
            `INSERT INTO books (title, file_path, file_type, uploaded_by, is_document, description, created_at)
             VALUES (?, ?, ?, ?, TRUE, ?, NOW())`,
            [paper.title, paper.path, 'application/pdf', librarianId, `Academic paper from ${paper.year}`]
          );
          addedCount++;
        }
      } catch (err) {
        console.error(`Error adding paper ${paper.title}:`, err);
      }
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      usersCreated: testUsers.length,
      papersAdded: addedCount,
      testCredentials: {
        student: { username: 'student1', password: 'password123' },
        teacher: { username: 'teacher1', password: 'password123' },
        librarian: { username: 'librarian1', password: 'password123' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Seeding failed', details: String(error) },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
