
import axios from '../handleService'

export default {
  getDBList: db_type => axios.get(`/api/catalog/${db_type}/databases`),
  getTableList: ({ db_type, database }) => axios.get(`/api/catalog/${db_type}/${database}/tables`),
  getFileList: path => axios.get(`/api/catalog/hdfs/file_list?path=${encodeURIComponent(path)}`),
  uploadFile: data => axios.post('/api/upload_file', data, { headers: {
    'Content-Type': 'multipart/form-data'
  }}),
  deleteUploadFile: file_name => axios.delete(`/api/upload_file?file_name=${encodeURIComponent(file_name)}`)
}