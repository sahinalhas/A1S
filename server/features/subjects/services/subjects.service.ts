import * as subjectsRepository from '../repository/subjects.repository.js';
import type { Subject, Topic } from '../types/subjects.types.js';

export function getAllSubjects(): Subject[] {
  return subjectsRepository.loadSubjects();
}

export function saveSubjectsList(subjects: Subject[]): void {
  if (!Array.isArray(subjects)) {
    throw new Error('Expected an array of subjects');
  }
  subjectsRepository.saveSubjects(subjects);
}

export function getAllTopics(): Topic[] {
  return subjectsRepository.loadTopics();
}

export function getTopicsBySubject(subjectId: string): Topic[] {
  const allTopics = subjectsRepository.loadTopics();
  return allTopics.filter(topic => topic.subjectId === subjectId);
}

export function saveTopicsList(topics: Topic[]): void {
  if (!Array.isArray(topics)) {
    throw new Error('Expected an array of topics');
  }
  subjectsRepository.saveTopics(topics);
}

export function resetToDefaults(): void {
  subjectsRepository.resetToDefaultData();
}
