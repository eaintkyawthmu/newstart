// new-to-america/schemaTypes/index.ts

import journeyPath from './journeyPath';
import module from './module';
import lesson from './lesson';
import quiz from './quiz';
import glossaryTerm from './glossaryTerm';
import lessonResource from './objects/lessonResource'; // Assuming 'objects' subfolder for this
import practicalExercise from './practicalExercise';
import taskProgress from './taskProgress';
import progressMilestone from './progressMilestone';
import reflection from './reflection';
import resource from './resource';
import user from './user';

export const schemaTypes = [
  journeyPath,
  module,
  lesson,
  quiz,
  glossaryTerm,
  lessonResource,
  resource,
  practicalExercise,
  taskProgress,
  progressMilestone,
  reflection,
  user
];
