export async function sendHiredNotification(freelancerId: string, projectTitle: string, clientName: string) {
  // In a real app, this would make an API call to send the notification
  console.log(`Sending hired notification to ${freelancerId} for ${projectTitle} from ${clientName}`)

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: `Notification sent to freelancer successfully!`,
      })
    }, 1000)
  })
}
