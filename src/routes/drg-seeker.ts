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
  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    return res.json({ status: 400, message: 'Invalid data format (data: [{row...}])' });
  }
  let data = [];
  for (let row of rows) {
    let dbfData: any = {
      hcode: process.env.HOSPCODE || row.hcode || '00000',
      dateadm: row?.los_day ? new Date(dayjs().subtract(row.los_day, 'days').format('YYYY-MM-DD')) : null,
      timeadm: row?.los_day ? '0000' : '',
      datedsc: row?.los_day ? new Date(dayjs().format('YYYY-MM-DD')) : null,
      timedsc: row?.los_day ? '0000' : '',
      los: row?.los_day || 0, leaveday: row?.leaveday || 0,
    };
    data.push({ ...row, ...dbfData });
  }
  const suffix = (await randomString(6, 'AlphaNumeric')).toString();
  const dbfFilePath = `${process.env.TEMP_FOLDER}/drg_${dayjs().format('YYYYMMDDHHmmss')}_${suffix}.dbf`;
  try {
    const foler = version=='5' ? process.env.TGRP5_FOLDER : process.env.TGRP6_FOLDER;
    const exeFile = version=='5' ? process.env.TGRP5 : process.env.TGRP6;
   
    
    createDrgTable(dbfFilePath, data)
      .then(async () => {
        let tgrpExe = `${foler}/${exeFile}`;
        let shCommand = `CD ${foler}/ && ${tgrpExe} ${dbfFilePath}`;
        await shell.exec(shCommand, { silent: true });
        const drgResult = await dbfToJson(dbfFilePath);

        let fileMetaData: any;
        await getFileMetadata(tgrpExe)
          .then(r => fileMetaData = r);

        fs.unlink(dbfFilePath, () => { });
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
module.exports = router;
