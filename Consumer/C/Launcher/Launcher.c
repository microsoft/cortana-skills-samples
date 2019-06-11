#include "pch.h"
#include <windows.h>
#include <stdio.h>
#include <tchar.h>

/*
https://support.microsoft.com/en-us/help/192806/how-to-run-control-panel-tools-by-typing-a-command
https://www.thewindowsclub.com/how-to-run-a-troubleshooter-from-the-command-line-in-windows-10
*/
#define N_CMDS 5
 static TCHAR* commands[N_CMDS][2] = {
	{ L"launcher:printDiagnostic", L"msdt /id PrinterDiagnostic" },
	{ L"launcher:printSettings", L"control printers" },
	{ L"launcher:audioRecordDiagnostic", L"msdt /id AudioRecordingDiagnostic" },
	{ L"launcher:audioRecordSettings", L"control mmsys.cpl sounds" },
	{ L"launcher:defender", L"C:\\Program Files\\Windows Defender\\MpCmdRun.exe -Scan"}
};

void _tmain(int argc, TCHAR *argv[])
{
	STARTUPINFO si;
	PROCESS_INFORMATION pi;

	ZeroMemory(&si, sizeof(si));
	si.cb = sizeof(si);
	ZeroMemory(&pi, sizeof(pi));

	if (argc != 2)
	{
		printf("Usage: %ls [app]\n", argv[0]);
		return;
	}

	int n = 0;
	for (n = 0; n < N_CMDS; n++)
	{
		if (0 == _tcscmp(argv[1], commands[n][0])) break;
	}
	if (n == N_CMDS)
	{
		printf("Cannot find: %ls\n", argv[1]);
		return;
	}

	// copy from literal to lp
	TCHAR command[256];
	_tcscpy_s(command, _countof(command), commands[n][1]);
	//ExpandEnvironmentStrings(commands[n][1], &command, 256); // program files is expanded oddly in x64
	printf("%ls\n", command);

	// Start the child process. 
	if (!CreateProcess(NULL,   // No module name (use command line)
		command,        // Command line
		NULL,           // Process handle not inheritable
		NULL,           // Thread handle not inheritable
		FALSE,          // Set handle inheritance to FALSE
		0,              // No creation flags
		NULL,           // Use parent's environment block
		NULL,           // Use parent's starting directory 
		&si,            // Pointer to STARTUPINFO structure
		&pi)           // Pointer to PROCESS_INFORMATION structure
		)
	{
		printf("CreateProcess failed (%d).\n", GetLastError());
		return;
	}

	// Wait until child process exits.
	WaitForSingleObject(pi.hProcess, INFINITE);

	// Close process and thread handles. 
	CloseHandle(pi.hProcess);
	CloseHandle(pi.hThread);
}
