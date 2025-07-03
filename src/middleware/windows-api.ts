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
    


    // let info: any;
    // เรียกใช้คำสั่ง PowerShell
    // exec(command, async (err, stdout, stderr) => {
    //     if (err) {
    //         console.error('Error executing PowerShell command:', err);
    //         return err;
    //     }
    //     if (stderr) {
    //         console.error('PowerShell error:', stderr);
    //         return stderr;
    //     }

    //     // แสดงผลลัพธ์ JSON
    //     try {
    //         info = JSON.parse(stdout);
    //         console.log (err, stdout)
    //         console.log ('stderr', stderr)
    //         // return info;
    //     } catch (parseError) {
    //         // console.error('Error parsing PowerShell output:', parseError);
    //         return parseError;
    //     }
    //     return info;
    // });
});