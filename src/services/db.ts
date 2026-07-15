import { 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, WorkoutRoutine, TrainingLog, WearableStats, NotificationSettings, Achievement } from '../types';

// CRITICAL CONSTRAINT: When the application initially boots, call getFromServer to test connection
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successful.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Call connection test immediately at import/load time
testConnection();

// HELPER: Sanitize email to form an elegant, clean ID helper
export function cleanId(email: string): string {
  return email.trim().toLowerCase();
}

function cleanDocId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
}

/**
 * USER MODULE FUNCTIONS
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${cleanId(profile.email)}`;
  try {
    const userDocRef = doc(db, 'users', cleanId(profile.email));
    await setDoc(userDocRef, profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(email: string): Promise<UserProfile | null> {
  const path = `users/${cleanId(email)}`;
  try {
    const userDocRef = doc(db, 'users', cleanId(email));
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * COACH STUDENTS MODULE FUNCTIONS
 */
export async function upsertCoachStudent(coachEmail: string, student: any): Promise<void> {
  const normalizedCoachEmail = cleanId(coachEmail);
  const studentKey = student.studentId || student.id || student.email;
  const path = `coachStudents/${cleanDocId(`${normalizedCoachEmail}_${studentKey}`)}`;

  try {
    const docRef = doc(db, 'coachStudents', cleanDocId(`${normalizedCoachEmail}_${studentKey}`));
    await setDoc(docRef, {
      ...student,
      coachEmail: normalizedCoachEmail,
      emailLower: student.email ? cleanId(student.email) : '',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function publishPrescribedRoutineToCoachStudent(
  coachEmail: string,
  student: any,
  routine: WorkoutRoutine
): Promise<void> {
  const normalizedCoachEmail = cleanId(coachEmail);
  const studentKeys = Array.from(new Set([
    student.studentId,
    student.id,
    student.email ? cleanId(student.email) : ''
  ].filter(Boolean)));
  const path = `coachStudents/${normalizedCoachEmail}_routine_aliases`;

  try {
    await Promise.all(studentKeys.map((studentKey) => {
      const docRef = doc(db, 'coachStudents', cleanDocId(`${normalizedCoachEmail}_${studentKey}`));
      return setDoc(docRef, {
        ...student,
        coachEmail: normalizedCoachEmail,
        emailLower: student.email ? cleanId(student.email) : '',
        prescribedRoutine: routine,
        latestRoutineId: routine.id,
        prescriptionPublishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadCoachStudents(coachEmail: string): Promise<any[]> {
  const normalizedCoachEmail = cleanId(coachEmail);
  const path = `coachStudents?coachEmail=${normalizedCoachEmail}`;

  try {
    const colRef = collection(db, 'coachStudents');
    const q = query(colRef, where('coachEmail', '==', normalizedCoachEmail));
    const snap = await getDocs(q);
    const students: any[] = [];
    snap.forEach((docSnap) => {
      students.push(docSnap.data());
    });
    return students;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function loadPrescribedRoutineForStudent(coachEmail: string | undefined, studentKey: string, studentEmail?: string): Promise<WorkoutRoutine | null> {
  const normalizedStudentKey = studentKey.trim();
  const path = coachEmail
    ? `coachStudents/${cleanDocId(`${cleanId(coachEmail)}_${normalizedStudentKey}`)}`
    : `coachStudents?studentId=${normalizedStudentKey}`;

  try {
    if (coachEmail) {
      const docRef = doc(db, 'coachStudents', cleanDocId(`${cleanId(coachEmail)}_${normalizedStudentKey}`));
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.prescribedRoutine) {
          return data.prescribedRoutine as WorkoutRoutine;
        }
      }
    }

    const colRef = collection(db, 'coachStudents');
    const byStudentId = query(colRef, where('studentId', '==', normalizedStudentKey));
    const snap = await getDocs(byStudentId);
    let routine: WorkoutRoutine | null = null;
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (!routine && data.prescribedRoutine) {
        routine = data.prescribedRoutine as WorkoutRoutine;
      }
    });
    if (routine) return routine;

    if (studentEmail) {
      const byEmail = query(colRef, where('emailLower', '==', cleanId(studentEmail)));
      const emailSnap = await getDocs(byEmail);
      emailSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (!routine && data.prescribedRoutine) {
          routine = data.prescribedRoutine as WorkoutRoutine;
        }
      });
    }

    return routine;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function deleteCoachStudent(coachEmail: string, studentKey: string): Promise<void> {
  const normalizedCoachEmail = cleanId(coachEmail);
  const path = `coachStudents/${cleanDocId(`${normalizedCoachEmail}_${studentKey}`)}`;

  try {
    const docRef = doc(db, 'coachStudents', cleanDocId(`${normalizedCoachEmail}_${studentKey}`));
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * WORKOUT ROUTINE MODULE FUNCTIONS
 */
export async function saveWorkoutRoutine(userEmail: string, routine: WorkoutRoutine): Promise<void> {
  const path = `users/${cleanId(userEmail)}/routines/${routine.id}`;
  try {
    const docRef = doc(db, 'users', cleanId(userEmail), 'routines', routine.id);
    await setDoc(docRef, routine);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadWorkoutRoutines(userEmail: string): Promise<WorkoutRoutine[]> {
  const path = `users/${cleanId(userEmail)}/routines`;
  try {
    const colRef = collection(db, 'users', cleanId(userEmail), 'routines');
    const q = query(colRef);
    const snap = await getDocs(q);
    const routines: WorkoutRoutine[] = [];
    snap.forEach((docSnap) => {
      routines.push(docSnap.data() as WorkoutRoutine);
    });
    return routines;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function deleteWorkoutRoutine(userEmail: string, routineId: string): Promise<void> {
  const path = `users/${cleanId(userEmail)}/routines/${routineId}`;
  try {
    const docRef = doc(db, 'users', cleanId(userEmail), 'routines', routineId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * LOGS MODULE FUNCTIONS
 */
export async function saveTrainingLog(userEmail: string, log: TrainingLog): Promise<void> {
  const path = `users/${cleanId(userEmail)}/logs/${log.id}`;
  try {
    const docRef = doc(db, 'users', cleanId(userEmail), 'logs', log.id);
    await setDoc(docRef, log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadTrainingLogs(userEmail: string): Promise<TrainingLog[]> {
  const path = `users/${cleanId(userEmail)}/logs`;
  try {
    const colRef = collection(db, 'users', cleanId(userEmail), 'logs');
    const q = query(colRef);
    const snap = await getDocs(q);
    const logs: TrainingLog[] = [];
    snap.forEach((docSnap) => {
      logs.push(docSnap.data() as TrainingLog);
    });
    // Sort descending by date (recent first)
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * WEARABLE STATS FUNCTIONS
 */
export async function saveWearableStats(userEmail: string, stats: WearableStats): Promise<void> {
  const path = `users/${cleanId(userEmail)}/wearable/stats`;
  try {
    const docRef = doc(db, 'users', cleanId(userEmail), 'wearable', 'stats');
    await setDoc(docRef, stats);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadWearableStats(userEmail: string): Promise<WearableStats | null> {
  const path = `users/${cleanId(userEmail)}/wearable/stats`;
  try {
    const docRef = doc(db, 'users', cleanId(userEmail), 'wearable', 'stats');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as WearableStats;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * NOTIFICATION CONFIGURATION FUNCTIONS
 */
export async function saveNotificationSettings(userEmail: string, settings: NotificationSettings): Promise<void> {
  const path = `users/${cleanId(userEmail)}/notifications/settings`;
  try {
    const docRef = doc(db, 'users', cleanId(userEmail), 'notifications', 'settings');
    await setDoc(docRef, settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadNotificationSettings(userEmail: string): Promise<NotificationSettings | null> {
  const path = `users/${cleanId(userEmail)}/notifications/settings`;
  try {
    const docRef = doc(db, 'users', cleanId(userEmail), 'notifications', 'settings');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as NotificationSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createAppNotification(userEmail: string, notification: {
  id?: string;
  type: string;
  title: string;
  message: string;
  routineId?: string;
  coachEmail?: string;
  read?: boolean;
}): Promise<void> {
  const normalizedEmail = cleanId(userEmail);
  const id = notification.id || `notif-${Date.now()}`;
  const path = `appNotifications/${cleanDocId(`${normalizedEmail}_${id}`)}`;

  try {
    const docRef = doc(db, 'appNotifications', cleanDocId(`${normalizedEmail}_${id}`));
    await setDoc(docRef, {
      ...notification,
      id,
      recipientEmail: normalizedEmail,
      read: notification.read ?? false,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function queueWorkoutPublishedEmail(params: {
  toEmail: string;
  studentName: string;
  coachEmail: string;
  routineTitle: string;
  routineId: string;
}): Promise<void> {
  const id = `workout-email-${Date.now()}-${cleanDocId(params.toEmail)}`;
  const path = `mailQueue/${id}`;

  try {
    const docRef = doc(db, 'mailQueue', id);
    await setDoc(docRef, {
      id,
      type: 'workout_published',
      status: 'pending',
      toEmail: cleanId(params.toEmail),
      studentName: params.studentName,
      coachEmail: cleanId(params.coachEmail),
      subject: 'O seu treino foi publicado no Treino Inteligente',
      message: `Olá ${params.studentName}, o seu Personal Trainer publicou o treino "${params.routineTitle}". Aceda à aplicação para consultar a sua rotina.`,
      routineTitle: params.routineTitle,
      routineId: params.routineId,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * FEED ACHIEVEMENTS (COMMUNITY INTERACTION)
 */
export async function createAchievement(achievement: Achievement): Promise<void> {
  const path = `achievements/${achievement.id}`;
  try {
    const docRef = doc(db, 'achievements', achievement.id);
    await setDoc(docRef, achievement);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadAchievements(): Promise<Achievement[]> {
  const path = 'achievements';
  try {
    const colRef = collection(db, 'achievements');
    const snap = await getDocs(colRef);
    const list: Achievement[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as Achievement);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateAchievementLikes(achievementId: string, likes: number, likedByUser: boolean): Promise<void> {
  const path = `achievements/${achievementId}`;
  try {
    const docRef = doc(db, 'achievements', achievementId);
    await updateDoc(docRef, { likes, likedByUser });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
