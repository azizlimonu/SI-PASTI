import { ref } from 'vue'
import { useToast } from './useToast'

export const useApi = () => {
  const loading = ref(false)
  const error = ref(null)
  const toast = useToast()

  const execute = async (apiFn, options = {}) => {
    const {
      onSuccess,
      onError,
      successMsg,
      errorMsg,
      showSuccessToast = true,
      showErrorToast = true
    } = options

    loading.value = true
    error.value = null

    try {
      const res = await apiFn()
      const data = res.data

      if (successMsg && showSuccessToast) {
        toast.success(successMsg)
      }

      if (onSuccess) onSuccess(data)
      return { success: true, data }

    } catch (e) {
      const msg = e.response?.data?.message || errorMsg || 'Terjadi kesalahan.'
      error.value = msg

      if (showErrorToast) toast.error(msg)
      if (onError) onError(e)

      return { success: false, error: msg }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, execute }
}