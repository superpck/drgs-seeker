import { exec } from 'child_process';

export const getFileMetadata = (async (fileName: string) => {
    // คำสั่ง PowerShell เพื่อดึงข้อมูลเวอร์ชัน
    const command = `powershell -command "(Get-Item '${fileName}').VersionInfo | Select-Object FileDescription, ProductName, ProductVersion, CompanyName | ConvertTo-Json"`;
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            reject(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            reject(`Stderr: ${stderr}`);
            return;
          }
          resolve(stdout.trim());
        });
      });
});