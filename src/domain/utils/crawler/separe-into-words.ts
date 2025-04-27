import voca from 'voca';

export const separeIntoWords = (name: string) =>
  voca(name)
    .chain()
    .lowerCase()
    .trim()
    .words(/[^\s]+/g)
    .value();
