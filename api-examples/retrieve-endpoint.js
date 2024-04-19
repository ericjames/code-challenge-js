import URI from "urijs";

// /records endpoint

window.path = "http://localhost:3000/records";

const RECORDS_PER_PAGE = 10;

// Your retrieve function plus any additional functions go here ...

// - **page** - Specifies which page to retrieve from the `/records` endpoint. If omitted, fetch page 1.
// - **colors** - An array of colors to retrieve from the `/records` endpoint. If omitted, fetch all colors.
const retrieve = async (options) => {
  console.log("CALLED", options);
  const { page = 1, colors = null } = options;
  let args = "";

  const apiPath = `${window.path}${getRecordsArgs(parseFloat(page), colors)}`;
  console.log("PATH", apiPath);

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetchData(apiPath, page);
      console.log("FINAL", response);
      if (response) {
        resolve(response);
      } else {
        resolve(false);
        // const retryResponse = await fetchData(apiPath, page);
        // console.log("retryResponse", retryResponse);
      }
    } catch (e) {
      console.log("failed", e);
    }
  });
};

// - **limit**: The number of items to be returned
// - **offset**: The index of the first item to be returned
// - **color[]**: Which color to be included in the result set. May be included multiple times, once for each color. If omitted, all colors will be returned.
const getRecordsArgs = (page, colors) => {
  let limitArg = RECORDS_PER_PAGE;
  let offsetArg = page && page > 1 ? page * RECORDS_PER_PAGE - 1 : 0;

  const colorsArg = colors ? colors.map((color) => `&color[]=${color}`) : "";

  // limit=2&offset=0&color[]=brown&color[]=green
  return `?limit=${limitArg}&offset=${offsetArg}${colorsArg}`;
};

const fetchData = (apiPath, requestedPageNumber) => {
  return (
    fetch(apiPath)
      .then((response) => {
        console.log("RESPONSE", response);
        return response;
      })
      .then((response) => response.json())
      .then((response) => {
        if (response) {
          return response;
          // return getPages(response);
        }
        return [];
      })
      .then((pages) => getFormattedResponse(pages, requestedPageNumber))
      .catch((e) => {
        console.log(e);
        return false;
      })
  );
};

const getFormattedResponse = (pages, requestedPageNumber) => {
  console.log("OK", pages);
  // 4. Upon a successful API response, transform the fetched payload into an object containing the following keys:
  // - **ids**: An array containing the ids of all items returned from the request.
  // - **open**: An array containing all of the items returned from the request that have a `disposition` value of `"open"`. Add a fourth key to each item called `isPrimary` indicating whether or not the item contains a primary color (red, blue, or yellow).
  // - **closedPrimaryCount**: The total number of items returned from the request that have a `disposition` value of `"closed"` and contain a primary color.
  // - **previousPage**: The page number for the previous page of results, or `null` if this is the first page.
  // - **nextPage**: The page number for the next page of results, or `null` if this is the last page.

  const isPrimary = (color) => {
    return ["red", "blue", "yellow"].indexOf(color) !== -1;
  };

  const response = {
    ids: pages.map((page) => page.id),
    open: pages.filter((page) => {
      if (page.disposition === "open") {
        console.log("WTF", page.color, isPrimary(page.color), page.disposition);
        return {
          ...page,
          isPrimary: isPrimary(page.color),
        };
      }
    }),
    closedPrimaryCount: pages.filter(
      (page) => page.disposition === "closed" && isPrimary(page.color)
    ).length,
    previousPage: requestedPageNumber > 1 ? requestedPageNumber - 1 : null,
    nextPage: requestedPageNumber + 1, // how would i know what the last page is
  };

  return response;
};

const getPages = (response) => {
  let pages = [];
  const pageCount = 3;

  const recordsToAdvance = RECORDS_PER_PAGE;
  let pageAdvanceLimit = 9;
  let currentPageIndex = 0;

  // create page slots
  for (let i = 0; i < pageCount; i++) {
    pages.push([]);
  }

  for (let r = 0; r < response.length; r++) {
    const record = response[r];

    // For each record, loop until hit pageAdvanceLimit
    // Then advance pageAdvanceLimit and add new page with record
    // Stop if page count has been reached

    // console.log(
    //   "\nrecord",
    //   r,
    //   "advance",
    //   pageAdvanceLimit,
    //   "page",
    //   currentPageIndex
    // );

    if (r <= pageAdvanceLimit) {
      // console.log("store", r, currentPageIndex, "advance", pageAdvanceLimit);
      pages[currentPageIndex].push(record);
    } else {
      const nextIndex = currentPageIndex + 1;

      if (!pages[nextIndex]) {
        // weve reached end of page slots
        break;
      }

      pageAdvanceLimit = recordsToAdvance * (nextIndex + 1) - 1;
      pages[nextIndex].push(record);
      currentPageIndex = nextIndex;
      // console.log(
      //   "NEW CALCULATION advancing to",
      //   pageAdvanceLimit,
      //   "page",
      //   currentPageIndex
      // );
      // console.log("store", r, currentPageIndex, "advance", pageAdvanceLimit);
    }
  }
  return pages;
};

export default retrieve;
