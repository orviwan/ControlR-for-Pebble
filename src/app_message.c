#include <pebble.h>
#include "app_message.h"
	
#define COMMAND_KEY 1

static bool AppMessageHighlander = false; //there can be only one
	
static void in_dropped_handler(AppMessageResult reason, void *context) {
	//APP_LOG(APP_LOG_LEVEL_DEBUG, "Incoming AppMessage from Pebble dropped, %d", reason);
}

static void out_sent_handler(DictionaryIterator *sent, void *context) {
	// outgoing message was delivered
	//APP_LOG(APP_LOG_LEVEL_DEBUG, "OUT SENT");	
}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
	//APP_LOG(APP_LOG_LEVEL_DEBUG, "Failed to send AppMessage to Pebble");
}

void appmessage_init(void) {
	app_message_register_inbox_dropped(in_dropped_handler);
	app_message_register_outbox_sent(out_sent_handler);
	app_message_register_outbox_failed(out_failed_handler);
	if(!AppMessageHighlander) {
		app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());	
		AppMessageHighlander = true;
	}
}

void send_data(uint16_t command) {
	Tuplet command_tuple = TupletInteger(COMMAND_KEY, command);
	DictionaryIterator *iter;
	app_message_outbox_begin(&iter);

	if (iter == NULL) {
		return;
	}

	dict_write_tuplet(iter, &command_tuple);
	dict_write_end(iter);
	app_message_outbox_send(); 
}