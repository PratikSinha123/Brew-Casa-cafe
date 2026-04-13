"use strict";

/**
 * Simple JSON-file store used by all route handlers.
 * In production you would swap this for a real database.
 */

const fs   = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

/** Ensure the data directory exists */
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read a JSON collection from disk; returns [] if the file doesn't exist yet.
 * @param {string} name  file name without extension, e.g. "reservations"
 */
function read(name) {
  const file = path.join(DATA_DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

/**
 * Persist an array to disk.
 * @param {string} name
 * @param {Array}  records
 */
function write(name, records) {
  const file = path.join(DATA_DIR, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(records, null, 2), "utf8");
}

/**
 * Append one record to a collection.
 * @param {string} name
 * @param {object} record
 * @returns {object} the inserted record (with an `id` field added)
 */
function insert(name, record) {
  const records = read(name);
  record.id = Date.now() + "-" + Math.random().toString(36).slice(2, 7);
  records.push(record);
  write(name, records);
  return record;
}

module.exports = { read, write, insert };
