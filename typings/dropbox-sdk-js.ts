declare namespace DropboxSdkJs {

    class Dropbox {
        constructor(options: { clientId: string });
        getAuthenticationUrl(redirectUri: string, state?: string): string;
        authTokenRevoke(): Promise<any>;
        setAccessToken(token: string): any;
        usersGetCurrentAccount(): Promise<UsersFullAccount>;
        filesListFolder(arg: FileListFolderArgs): Promise<FilesListFolderResult>;
        filesDownload(arg: 	FilesDownloadArg): Promise<FilesFileMetadata>;
        filesGetMetadata(arg: FilesGetMetadataArg): Promise<FilesFileMetadata>;
        filesUpload(args: FilesCommitInfo): Promise<FilesFileMetadata>;
    }


    interface UsersName {
        display_name: string;
    }

    interface UsersFullAccount {
        email: string;
        name: UsersName
    }

    interface UserMessage {
        text: string;
        locale: string;
    }

    interface Error<T> {
        error_summary: string;
        error: T;
        user_message: UserMessage;
    }

    interface FileListFolderArgs {
        path: string;
        recursive: boolean;
        include_media_info: boolean;
        include_deleted: boolean;
        include_has_explicit_shared_members: boolean;
    }

    interface FilesPathRootError {
        path_root: string;
    }

    interface FilesLookupError {
        malformed_path: string;
        invalid_path_root: FilesPathRootError; 
    }

    interface FilesListFolderError {
        path: FilesLookupError;
    }

    interface FilesFileMetadata {
        name: string;
        id: string;
        client_modified: string;
        server_modified: string;
        path_lower: string;
        fileBlob: Blob;

    }

    interface FilesListFolderResult {
        entries: FilesFileMetadata[];
        cursor: string;
        has_more: boolean;
    }

    interface FilesDownloadArg {
        path: string;
    }

    interface FilesGetMetadataArg {
        path: string;
        include_media_info: boolean;
        include_deleted: boolean;
        include_has_explicit_shared_members: boolean;
    }

    interface FilesWriteMode {
        ".tag": string;
        update?: string;
    }

    interface FilesCommitInfo {
        contents: Object;
        path: string;
        mode: FilesWriteMode;
        autorename: boolean;
        mute: boolean;
    }
}

declare class Dropbox extends DropboxSdkJs.Dropbox {};