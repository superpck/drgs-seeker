import { DBFFile } from 'dbffile';
import fs from 'fs';

export const drgColumn = () => {
    const baseColumns = [
        { name: 'hcode', type: 'C', size: 9 },
        { name: 'hn', type: 'C', size: 10 },
        { name: 'an', type: 'C', size: 10 },
        { name: 'pid', type: 'C', size: 10 },
        { name: 'dateadm', type: 'D', size: 8 },
        { name: 'timeadm', type: 'C', size: 4 },
        { name: 'datedsc', type: 'D', size: 8 },
        { name: 'timedsc', type: 'C', size: 4 },
        { name: 'los', type: 'N', size: 3 },
        { name: 'leaveday', type: 'N', size: 3 },
        { name: 'actlos', type: 'N', size: 3 },
        { name: 'dischs', type: 'C', size: 1 },
        { name: 'discht', type: 'C', size: 1 },
        { name: 'dob', type: 'D', size: 8 },
        { name: 'age', type: 'C', size: 3 },
        { name: 'ageday', type: 'C', size: 3 },
        { name: 'sex', type: 'C', size: 1 },
        { name: 'admwt', type: 'N', size: 11, decimalPlaces: 3 },
        { name: 'pdx', type: 'C', size: 6 },
        { name: 'drpdx', type: 'C', size: 6 },
    ] as const;

    // Dynamic columns - diagnosis codes (1-10)
    const diagnosisColumns = Array.from({ length: 10 }, (_, i) => [
        { name: `sdx${i + 1}`, type: 'C', size: 6 },
        { name: `drsdx${i + 1}`, type: 'C', size: 15 }
    ]).flat();

    // Dynamic columns - procedures (1-20)
    const procedureColumns = Array.from({ length: 20 }, (_, i) => [
        { name: `proc${i + 1}`, type: 'C', size: 7 },
        { name: `datein${i + 1}`, type: 'D', size: 8 },
        { name: `timein${i + 1}`, type: 'C', size: 4 },
        { name: `dateout${i + 1}`, type: 'D', size: 8 },
        { name: `timeout${i + 1}`, type: 'C', size: 4 },
        { name: `drop${i + 1}`, type: 'C', size: 15 }
    ]).flat();

    // Footer columns - insurance, billing, and DRG data
    const otherColumns = [
        { name: 'inscl', type: 'C', size: 4 },
        { name: 'subtype', type: 'C', size: 2 },
        { name: 'cid', type: 'C', size: 16 },
        { name: 'hospmain', type: 'C', size: 5 },
        { name: 'hospsub', type: 'C', size: 5 },
        { name: 'referin', type: 'C', size: 5 },
        { name: 'referout', type: 'C', size: 5 },
        { name: 'pttype', type: 'C', size: 4 },
        { name: 'total', type: 'N', size: 7 },
        { name: 'paid', type: 'N', size: 7 },
        { name: 'insure', type: 'C', size: 4 },
        { name: 'grp', type: 'N', size: 1 },
        { name: 'insuregrp', type: 'C', size: 2 },
        { name: 'mdc', type: 'C', size: 2 },
        { name: 'drg', type: 'C', size: 5 },
        { name: 'rw', type: 'N', size: 7, decimalPlaces: 8 },
        { name: 'adjrw', type: 'N', size: 8, decimalPlaces: 4 },
        { name: 'wtlos', type: 'N', size: 9, decimalPlaces: 2 },
        { name: 'ot', type: 'N', size: 4, decimalPlaces: 0 },
        { name: 'result', type: 'C', size: 1 },
        { name: 'err', type: 'N', size: 2 },
        { name: 'warn', type: 'N', size: 4 },
        { name: 'rem', type: 'C', size: 1 },
        { name: 'tgrp', type: 'C', size: 20 },
    ] as const;

    return [
        ...baseColumns,
        ...diagnosisColumns,
        ...procedureColumns,
        ...otherColumns
    ];
};

export const dbfToJson = (async (fileName: string) => {
    try {
        const dbf = await DBFFile.open(fileName); // ระบุเส้นทางไฟล์ DBF
        const records = await dbf.readRecords(); // records จะเป็น array ของ objects
        return records;
    } catch (err) {
        console.error('Error reading DBF file:', err);
    }
});

export const createDrgTable = (async (fileName: string, data: any) => {
    // กำหนดเส้นทางไฟล์ DBF ที่ต้องการสร้าง
    fs.unlink(fileName, () => { });

    // สร้างไฟล์ DBF ใหม่ พร้อมระบุฟิลด์ (fields)
    let columns: any = drgColumn();

    const dbf = await DBFFile.create(fileName, columns);
    return await dbf.appendRecords(data);
});