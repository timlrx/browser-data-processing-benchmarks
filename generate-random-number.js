import { writeFile } from "fs";

function randomGenerator(n) {
  const array = Array.from(
    { length: n },
    () => Math.floor(Math.random() * 1_000_000) + 1
  );
  return array;
}

const jsonData = JSON.stringify(randomGenerator(1000));
writeFile("numbers.json", jsonData, function (err) {
  if (err) {
    console.log(err);
  }
});
