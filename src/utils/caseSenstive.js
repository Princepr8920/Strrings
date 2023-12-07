function smallLetters(data, wordsToChange) {
  for (let key in data) {
    if (data[key] && wordsToChange.includes(key)) {
      data[key] = data[key].toLowerCase();
    }
  }
  return data;
}

function firstLetterUpperCase(data, wordsToChange) {
  for (let key in data) {
    if (data[key] && wordsToChange.includes(key)) {
      let small = data[key].toLowerCase().substring(1);
      data[key] = data[key][0].toUpperCase() + small;
    }
  }

  return data;
}

module.exports = { smallLetters, firstLetterUpperCase };
