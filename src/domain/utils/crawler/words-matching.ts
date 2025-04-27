import voca from 'voca';

import { removeAccents } from './remove-accents.js';
import { separeIntoWords } from './separe-into-words.js';

type WordsMatchingProps = {
  originalName: string;
  querySearchByFilter: string;
  price?: number;
  debug?: boolean;
};

export const wordsMatching = ({
  originalName,
  querySearchByFilter = '',
  price,
  debug = false,
}: WordsMatchingProps) => {
  // Removes accents from the original name
  const normalizedOriginalName = removeAccents(originalName);

  // Converts the name to lowercase and removes special characters
  const cleanOriginalName = voca(normalizedOriginalName)
    .chain()
    .lowerCase()
    .replace(/[^\w\s.-]/g, ' ')
    .value();

  // Splits the cleaned original name into individual words
  const originalNameWords: string[] = separeIntoWords(cleanOriginalName);

  // Splits the query filter string into an array of words
  const queryFilterWordsArray: string[] = separeIntoWords(querySearchByFilter);

  // Filters the words that match between the original name and the search filter
  const matchedSearchWords = queryFilterWordsArray.filter((queryWord: string) =>
    originalNameWords.some((productWord) =>
      voca(productWord).includes(queryWord),
    ),
  );

  // Removes duplicates from the matched words
  const uniqueMatchedSearchWords = [...new Set(matchedSearchWords)];

  // Calculates the match ratio of the search filter words relative to the total number of words in the filter array
  const queryMatchRatio =
    queryFilterWordsArray.length > 0
      ? uniqueMatchedSearchWords.length / queryFilterWordsArray.length
      : 0;

  if (debug) {
    console.log({
      normalizedOriginalName,
      price,
      cleanOriginalName,
      originalNameWords,
      queryFilterWordsArray,
      matchedSearchWords,
      uniqueMatchedSearchWords,
      queryMatchRatio,
    });
  }

  return {
    queryMatchRatio,
  };
};
