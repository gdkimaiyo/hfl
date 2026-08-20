import fs from "fs";
import fileSystem from "fs-extra";
import https from "https";
import http from "http";
import { v4 as uuid } from "uuid";
import url from "url";
import crypto from "crypto";

/**
 * Utility helper class with various formatting, date, file, and general-purpose functions.
 */
class Utils {
  /**
   * Converts a string to sentence case (first letter capitalized).
   * @param {string} word - The string to convert.
   * @returns {string}
   */
  static toSentenceCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  /**
   * Formats a date string into a readable format like "Mon, Jan 1st 2024 12:00 pm".
   * @param {string|Date} dateStr
   * @returns {string}
   */
  static formatDate(dateStr) {
    const date = new Date(dateStr);
    return moment(date).format("ddd, MMM Do YYYY hh:mm a");
  }

  /**
   * Returns the current date in long format like "January 1, 2024 12:00 PM".
   * @returns {string}
   */
  static formattedDate() {
    const dt = Date.now();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hourCycle: "h12",
    })
      .format(dt)
      .replace(/(\d{4}),/, "$1");

    return formattedDate;
  }

  /**
   * Returns the previous month in format "MMM, YYYY".
   * @returns {string}
   */
  static getPreviousMonth() {
    return moment().date(0).format("MMM, YYYY");
  }

  /**
   * Converts a date string to ISO format for DB storage, applying timezone conversion.
   * @param {string} dateStr
   * @param {string} [timezone='Africa/Nairobi']
   * @returns {string}
   */
  static formatDateForDatabase(dateStr, timezone = "Africa/Nairobi") {
    if (!dateStr || typeof dateStr !== "string") return dateStr;
    const formattedDate = DateDialogHelper.changeDateFormat(dateStr);
    return momenttz.tz(formattedDate, "MM/DD/YYYY HH:mm", timezone).toISOString();
  }

  /**
   * Returns the next alphabet in sequence.
   * @param {string} firstChar
   * @returns {string}
   */
  static nextAlphabet(firstChar) {
    const char = firstChar.toUpperCase();
    return String.fromCharCode(char.charCodeAt(0) + 1);
  }

  /**
   * Converts a writable stream to a readable stream.
   * @param {object} writableStream
   * @returns {fs.ReadStream}
   */
  static writableToReadableStream(writableStream) {
    return fs.createReadStream(writableStream.path);
  }

  /**
   * Subtracts hours from a given date string.
   * @param {number} noOfHours
   * @param {string} date
   * @returns {string}
   */
  static removeHoursFromDate(noOfHours, date) {
    const rawDate = moment(date, "DD/MM/YYYY HH:mm").subtract(noOfHours, "hours");
    return rawDate.format("DD/MM/YYYY HH:mm");
  }

  /**
   * Splits an array into chunks of the given size.
   * @param {Array} array
   * @param {number} number
   * @returns {Array[]}
   */
  static chunkArray(array, number) {
    if (!Array.isArray(array) || !array.length) {
      return [];
    }
    return [array.slice(0, number)].concat(this.chunkArray(array.slice(number), number));
  }

  /**
   * Converts minutes to milliseconds.
   * @param {number} minutes
   * @returns {number}
   */
  static convertMinutesToSeconds(minutes) {
    return 1000 * 60 * minutes;
  }

  /**
   * Formats a time string (HH:mm) into localized time (e.g., 1:00 PM).
   * @param {string} time
   * @returns {string}
   */
  static formatTime(time) {
    return moment(time.trim(), "HH:mm").format("LT");
  }

  /**
   * Maps an array of objects and returns the value of the specified key from each object.
   * @param {Object[]} array
   * @param {string} key
   * @returns {Array}
   */
  static mapThroughArrayOfObjectsByKey(array, key) {
    if (array.length < 1) {
      return [];
    }
    return array.map((item) => item[key]);
  }

  /**
   * Downloads an image from a URL and saves it to a local directory.
   * @param {string} uri - The image URL.
   * @param {string} destination - Directory path to save the image.
   * @returns {Promise<string>} - Path to saved image file.
   */
  static convertToImageAndSaveToLocal(uri, destination) {
    const theUrl = url.parse(uri);
    if (!theUrl.host) throw new Error("Requested URL is invalid");
    const client = theUrl.protocol === "https:" ? https : http;
    Utils.createDirectory(destination);
    const filename = uuid();
    return new Promise((resolve, reject) => {
      const fileDir = `${destination}/${filename}`;
      const file = fs.createWriteStream(fileDir);
      client
        .get(uri, (response) => {
          response.pipe(file);
          file.on("finish", () => {
            file.close(() => {
              resolve(file.path);
            });
          });
        })
        .on("error", (err) => {
          fs.unlink(fileDir, () => {});
          reject(err);
        });
    });
  }

  /**
   * Creates a directory if it doesn't exist.
   * @param {string} filePath
   * @returns {void}
   */
  static createDirectory(filePath) {
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath);
    }
  }

  /**
   * Removes a file at a given path.
   * @param {string} fileDir
   * @returns {Promise<void>}
   */
  static async removeFile(fileDir) {
    await fileSystem.unlink(fileDir);
  }

  /**
   * Converts seconds to milliseconds.
   * @param {number} seconds
   * @returns {number}
   */
  static convertSecondsToMs(seconds) {
    const ONE_SEC_TO_MS = 1000;
    return seconds * ONE_SEC_TO_MS;
  }
}

export default Utils;
