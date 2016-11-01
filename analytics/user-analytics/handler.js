export default (event, context) => {
  return getResults();
};

function getResults() {
  return Promise.resolve({
    "total": {
      "all": 67,
      "confirmed": 34,
      "pending": 33,
      "statuses": {
        "active": 0,
        "pasive": 0,
        "inactive": 0
      },
      "registration_type": {
        "organic": 0,
        "invitated": 0
      },
      "countries": {
        "unknown": 32,
        "EC": 1,
        "US": 1
      },
      "genres": {
        "male": 18,
        "female": 16
      },
      "ages": {
        "0": 7,
        "13": 1,
        "15": 2,
        "20": 1,
        "22": 2,
        "26": 3,
        "29": 2,
        "30": 1,
        "34": 1,
        "38": 2,
        "44": 1,
        "45": 8,
        "55": 2,
        "57": 1
      }
    }
  });
}
