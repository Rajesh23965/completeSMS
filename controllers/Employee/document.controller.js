import DocumentModel from "../../models/Employee/document.model.js";
import path from "path";
import fs from "fs";
export default class DocumentController {

    /* =========================
       GET ALL Documents for Employee
    ========================== */
    static async getEmployeeDocuments(req, res) {
        try {
            const { id } = req.params;
            const documents = await DocumentModel.getByEmployeeId(id);

            return res.status(200).json({
                success: true,
                data: documents
            });
        } catch (error) {
            console.error("Get Documents Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       CREATE Employee Document
    ========================== */
    static async createDocument(req, res) {
        try {
            const { id } = req.params;

            // Extract data from request
            const { title, category, document_type, remarks } = req.body;

            // Check if file was uploaded
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Document file is required"
                });
            }

            // Validate required fields
            if (!title || !category) {
                return res.status(400).json({
                    success: false,
                    message: "Title and category are required fields"
                });
            }

            const data = {
                employee_id: parseInt(id),
                title,
                category,
                document_type: document_type || null,
                document_file: req.file.filename, // Assuming you're using multer for file upload
                remarks: remarks || null
            };

            // Create document
            const documentId = await DocumentModel.create(data);

            return res.status(201).json({
                success: true,
                message: "Document created successfully",
                data: { id: documentId }
            });
        } catch (error) {
            console.error("Create Document Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       GET Single Document
    ========================== */
    static async getDocument(req, res) {
        try {
            const { docId } = req.params;
            const document = await DocumentModel.getById(docId);

            if (!document) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: document
            });
        } catch (error) {
            console.error("Get Document Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       UPDATE Document
    ========================== */
    static async updateDocument(req, res) {
        try {
            const { id, docId } = req.params;
            const { title, category, document_type, remarks } = req.body;

            // Verify document exists and belongs to employee
            const document = await DocumentModel.getById(docId);
            if (!document || document.employee_id !== parseInt(id)) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found"
                });
            }

            // Prepare update data
            const data = {
                title: title || document.title,
                category: category || document.category,
                document_type: document_type || document.document_type,
                remarks: remarks !== undefined ? remarks : document.remarks,
                // If new file uploaded, use it; otherwise keep existing
                document_file: req.file ? req.file.filename : document.document_file
            };

            // Update document
            const updated = await DocumentModel.update(docId, data);

            if (updated === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to update document"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Document updated successfully"
            });
        } catch (error) {
            console.error("Update Document Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       DELETE Document
    ========================== */
    static async deleteDocument(req, res) {
        try {
            const { id, docId } = req.params;

            // Verify document exists and belongs to employee
            const document = await DocumentModel.getById(docId);
            if (!document || document.employee_id !== parseInt(id)) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found"
                });
            }

            const deleted = await DocumentModel.delete(docId);

            if (deleted === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Failed to delete document"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Document deleted successfully"
            });
        } catch (error) {
            console.error("Delete Document Error:", error);
            return res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }

    /* =========================
       DOWNLOAD Document
    ========================== */

static async downloadDocument(req, res) {
    try {
        const { docId } = req.params; // Only get docId
        console.log('Download request for docId:', docId);

        const document = await DocumentModel.getById(docId);
        console.log('Found document:', document);

        if (!document) {
            return res.status(404).send("Document not found");
        }

        // File path - adjust based on your actual upload location
        const filePath = path.resolve(
            "public/uploads/documents",
            document.document_file
        );
        console.log('Looking for file at:', filePath);

        if (!fs.existsSync(filePath)) {
            console.log('File not found at:', filePath);
            
            // Try alternative paths
            const altPaths = [
                path.resolve("uploads/documents", document.document_file),
                path.resolve("public/uploads/documents", document.document_file),
                path.resolve(__dirname, "../../../public/uploads/documents", document.document_file)
            ];
            
            for (const altPath of altPaths) {
                console.log('Trying alternative path:', altPath);
                if (fs.existsSync(altPath)) {
                    console.log('Found file at:', altPath);
                    return res.download(altPath, document.document_file);
                }
            }
            
            return res.status(404).send("File not found");
        }

        console.log('File found, downloading:', document.document_file);
        res.download(filePath, document.document_file);

    } catch (err) {
        console.error('Download error:', err);
        res.status(500).send("Download error");
    }
}


}