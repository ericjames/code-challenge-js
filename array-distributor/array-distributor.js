"use strict";

/*
 * Distribute a given array to the end and beginning of a new array
 * Also known as equal distribution of items
 * @param list array of any
 * @return list array of any
 */

function getDistributedList(list) {
  // Create empty placeholder array based on passed array
  const newArray = list.map(() => null);

  const listRange = list.length;
  const listHalfRange = Math.floor(listRange / 2);
  const hasRemainder = isOdd(listRange);

  // Total positions from each side of the array that counts down
  // The right position is given the remainder since its the starting push
  let fromRight = hasRemainder ? listHalfRange + 1 : listHalfRange;
  let fromLeft = listHalfRange;

  // console.log("left, right", fromLeft, fromRight);

  // This implementation calculates the actual positions
  // which could have real world application vs a boolean flipper
  for (var i = 0; i < listRange; i++) {
    const value = list[i];
    const position = i;
    // console.log("POSITION", position, value);
    if (isOdd(position)) {
      // Place at beginning of array
      const pos = listHalfRange - fromLeft;
      // console.log("Odd Position", pos, "gets", value);
      newArray[pos] = value;
      fromLeft--;
    } else {
      // Place at end of array
      const rightRange = hasRemainder ? listHalfRange + 1 : listHalfRange;
      const pos = listRange - (rightRange - fromRight) - 1; // minus 1 to ref array position
      // console.log("Even Position", pos, "gets", value);
      newArray[pos] = value;
      fromRight--;
    }
  }

  function isOdd(num) {
    return num % 2 === 1;
  }
  console.log(newArray);

  return newArray;
}

function checkResult(result, match) {
  const isMatch = JSON.stringify(result) === JSON.stringify(match);
  if (isMatch) {
    console.log("\nTest Passes! ", match, "\n");
  } else {
    console.warn("\nTest FAILS expected ", match, "\n");
  }
}

checkResult(getDistributedList([0, 1]), [1, 0]);
checkResult(getDistributedList([1, 2]), [2, 1]);
checkResult(getDistributedList([1, 2, 3]), [2, 3, 1]);
checkResult(getDistributedList([1, 2, 3, 4]), [2, 4, 3, 1]);
checkResult(getDistributedList([1, 2, 3, 4, 5]), [2, 4, 5, 3, 1]);
checkResult(getDistributedList([1, 2, 3, 4, 5, 6]), [2, 4, 6, 5, 3, 1]);
checkResult(getDistributedList([1, 2, -3, -4, -5, 6]), [2, -4, 6, -5, -3, 1]);
checkResult(
  getDistributedList([100, -100, -3.5, -4, -5, 6]),
  [-100, -4, 6, -5, -3.5, 100]
);
