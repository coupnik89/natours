import axios from 'axios'
import { showAlert } from './alert'

// Type is either 'password' or 'data'
export const updateData = async (data, type) => {
    try {
        const url = type === 'password' ? '/api/v1/users/updatePassword' : '/api/v1/users/updateSelf'

        const res = await axios({
            method: 'PATCH',
            url,
            data
        })

        if(res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`)
        }
    } catch (error) {
        showAlert('error', 'Unable to update. Please try again later.')
    }
}