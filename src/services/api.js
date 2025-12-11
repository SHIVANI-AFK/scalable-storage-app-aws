import { mockRecentFiles, mockSharedFiles } from './mockData';

// This service simulates calls to AWS API Gateway
// In a real application, this would use fetch or axios to call the API endpoints

const API_BASE_URL = 'https://api.playbutton.com/v1'; // Placeholder

export const api = {
    // Simulate fetching recent files from Lambda -> DynamoDB/S3
    getRecentFiles: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockRecentFiles);
            }, 500); // Simulate network latency
        });
    },

    // Simulate fetching shared files
    getSharedFiles: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(mockSharedFiles);
            }, 500);
        });
    },

    // Simulate file upload to S3 via Presigned URL
    uploadFile: async (file) => {
        console.log(`Uploading ${file.name} to S3...`);
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, url: `https://s3.aws.com/bucket/${file.name}` });
            }, 1000);
        });
    },

    // Simulate authentication with Cognito
    login: async (username, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ token: 'mock-jwt-token', user: { name: 'Michael Smith' } });
            }, 800);
        });
    }
};
