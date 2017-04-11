class Configuration {

    public storage(): StorageClient {
        // return new MockStorageClient();
        return new DropboxStorageClient();
    }

    public fileFormat(): FileFormat {
        // return new PlainFileFormat();
        return new FileFormatV2();
    }

    public ui(domain: Domain): UI {
        return new UI(domain);
    }

    public domain(storage: StorageClient, fileFormat: FileFormat): Domain {
        return new Domain(storage, fileFormat);
    }

}