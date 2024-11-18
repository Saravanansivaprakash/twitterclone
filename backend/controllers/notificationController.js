import Notification from "../models/notificationModel.js";

export const getNotifications = async (request, response) => {
    try {
		const userId = request.user._id;

		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});

		await Notification.updateMany({ to: userId }, { read: true });

		response.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications controller", error.message);
		response.status(500).json({ error: "Internal Server Error" });
	}

}

export const deleteNotifications  = async (request, response) => {
    try {
		const userId = request.user._id;

		await Notification.deleteMany({ to: userId });

		response.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications controller", error.message);
		response.status(500).json({ error: "Internal Server Error" });
	}

}

