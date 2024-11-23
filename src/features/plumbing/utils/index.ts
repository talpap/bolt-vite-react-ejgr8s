import { FirestoreTimestamp, ApartmentData } from '../types';

export const convertTimestampToDate = (timestamp: FirestoreTimestamp): Date => {
  return new Date(timestamp.seconds * 1000);
};

export const convertDateToFirestore = (date: Date) => {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0
  };
};

export const prepareDataForFirestore = (data: ApartmentData): ApartmentData => {
  return {
    ...data,
    issues: data.issues.map(issue => ({
      ...issue,
      dateAdded: issue.dateAdded instanceof Date ? convertDateToFirestore(issue.dateAdded) : issue.dateAdded
    }))
  };
};

export const prepareDataFromFirestore = (data: ApartmentData): ApartmentData => {
  return {
    ...data,
    issues: data.issues.map(issue => ({
      ...issue,
      dateAdded: isFirestoreTimestamp(issue.dateAdded) ? convertTimestampToDate(issue.dateAdded) : issue.dateAdded
    }))
  };
};