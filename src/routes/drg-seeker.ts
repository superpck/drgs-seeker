import express, { NextFunction } from "express";
import dayjs from "dayjs";
import fs from 'fs';
import path from "path";
import { dbfToJson, createDrgTable } from "../middleware/dbf-util";
import { getFileMetadata } from "../middleware/windows-api";
import { randomString } from "../middleware/utils";
const { name, version, subVersion } = require("./../../package.json");

const router = express.Router();
const shell = require("shelljs");
const cron = require("node-cron");

let idleMinutes = 0;

router.get("/", async (req, res, next) => {
  res.send({
    apiName: name,
    version,
    subVersion,
    date: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
  });
});

router.post("/seeker", async (req: any, res: any, next: NextFunction) => {
  const version = req.body.version || '6';
  const rows = req.body.data;
  let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    console.log(`status 400, Invalid data format (data: [{row...}])`, ip);
    return res.json({ status: 400, message: 'Invalid data format (data: [{row...}])' });
  }
  let data = [];
  for (let row of rows) {
    data.push({
      ...transformBefore(row),
      hcode: row.hcode || process.env.HOSPCODE || '00000'
    });
  }

  const suffix = (await randomString(6, 'AlphaNumeric')).toString();
  const dbfFilePath = `${process.env.TEMP_FOLDER}/drg_${dayjs().format('YYYYMMDDHHmmss')}_${suffix}.dbf`;

  console.log(`DRG Seeker Request ${version}, ${dbfFilePath}`, data);

  try {
    const folder = version == '5' ? process.env.TGRP5_FOLDER : process.env.TGRP6_FOLDER;
    const exeFile = version == '5' ? process.env.TGRP5 : process.env.TGRP6;

    createDrgTable(dbfFilePath, data)
      .then(async () => {
        let tgrpExe = `${folder}/${exeFile}`;
        let shCommand = `CD ${folder}/ && ${tgrpExe} ${dbfFilePath}`;
        await shell.exec(shCommand, { silent: true });
        let drgResult = await dbfToJson(dbfFilePath);
        console.log(`DRG Result: `, drgResult);
        drgResult = drgResult.map((item: any) => {
          return transformAfter(item);
        });

        let fileMetaData: any;
        await getFileMetadata(tgrpExe)
          .then(r => fileMetaData = r);

        fs.unlink(dbfFilePath, () => { });
        console.log(`status 200, Success`, ip);
        return res.json({ status: 200, data: drgResult, tgrp: { FileName: tgrpExe, metadata: fileMetaData } });
      })
      .catch((error) => {
        console.error('Error:', error.message)
        return res.json({ status: 400, message: error.message });
      });
  } catch (error) {
    return res.json({ status: 500, message: error.message });
  }
});

cron.schedule("* * * * *", () => {
  idleMinutes++;
  if (idleMinutes % 15 == 0) {
    console.info(dayjs().format('HH:mm:ss'), `Idle ${idleMinutes} Minute<s>, Cleansing Grouper`);
    unlinkCDX(process.env.TGRP6_FOLDER, ".cdx");
    unlinkCDX(process.env.TGRP5_FOLDER, ".cdx");
    idleMinutes = 0;
  }
});

async function unlinkCDX(directory: string, extension: string) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      return console.error(`Unable to read directory (${directory}): ${err.message}`);
    }

    // กรองเฉพาะไฟล์ที่มีนามสกุลตรงกับที่ต้องการลบ
    files
      .filter((file) => path.extname(file).toLowerCase() === extension)
      .forEach((file) => {
        const filePath = path.join(directory, file);
        console.log("Delete", filePath);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${filePath}: ${err.message}`);
          }
        });
      });
  });
}

function transformBefore(row: any) {
  if (row?.sex) {
    row.sex = row.sex.toString();
  }
  if (row?.age) {
    row.age = row.age + "";
  }
  if (row?.ageday) {
    row.ageday = row.ageday + "";
  }
  let los = row?.los_day || row?.los || 0;

  if (row?.dateadm && row?.datedsc) {
    row.dateadm = new Date(row.dateadm);
    row.datedsc = new Date(row.datedsc);
  } else {
    row.dateadm = los ? new Date(dayjs().subtract(los, 'days').format('YYYY-MM-DD')) : null;
    row.timeadm = los ? '0000' : '';
    row.datedsc = los ? new Date(dayjs().format('YYYY-MM-DD')) : null;
    row.timedsc = los ? '0000' : '';
  }

  row.los = los;
  row.leaveday = row?.leaveday || 0;
  return row;
}

function transformAfter(row: any) {
  row.dateadm = row.dateadm ? dayjs(row.dateadm).format('YYYY-MM-DD') : null;
  row.datedsc = row.datedsc ? dayjs(row.datedsc).format('YYYY-MM-DD') : null;
  return row;
}

module.exports = router;
