#include <node.h>
#include <sstream>
#include "NodeOpenAlDevice.h"

using namespace v8;

//vector<NodeOpenALDevice*> NodeOpenALDevice::devices;

void CheckALError(const char* operation) {

	ALenum alErr = alGetError();
	if(alErr == AL_NO_ERROR) return;
	std::stringstream ss;
	switch(alErr){
		case AL_INVALID_NAME:
			ss << "OpenAL error: " << AL_INVALID_NAME;
			break;
		case AL_INVALID_VALUE:
			ss << "OpenAL error: " << AL_INVALID_VALUE;
			break;
		case AL_INVALID_ENUM:
			ss << "OpenAL error: " << AL_INVALID_ENUM;
			break;
		case AL_INVALID_OPERATION:
			ss << "OpenAL error: " << AL_INVALID_OPERATION;
			break;
		case AL_OUT_OF_MEMORY:
			ss << "OpenAL error: " << AL_OUT_OF_MEMORY;
			break;
	}

	std::cout << ss << endl;
}

void testForALCError(ALCdevice *device) {
  ALenum error;
  error = alcGetError(device);
  if (error != ALC_NO_ERROR)
    printf("\nALC Error %x occurred: %s\n", error, alcGetString(device, error));
}


// ------------------------------------------
NodeOpenALDevice::NodeOpenALDevice() {
	// differentiate between different devices here
	// e.g. device = alcOpenDevice((const ALCchar *) "Built-in Output\0");
	device = alcOpenDevice(NULL);


//	void *addr = (void*)0x19;
//	printf("Address: %p\n", addr);
//	device = alcOpenDevice((const ALCchar *) "Built-in Output\0");
//	device = *((ALCdevice*)&(PIC_LOC+));
//	device = ((ALCdevice*)&(addr));

//	ALCdevice *device = alcOpenDevice(NULL);
//	CheckALError("open device 1");
//	ALCdevice *device2 = alcOpenDevice(NULL);
//	CheckALError("open device 2");
//	(int *) p = &device2;
////
//	cout << "OpenAL available device: " << device << endl;
//	cout << "OpenAL available device2: " << device2 << endl;
//	cout << "OpenAL available p: " << *p << endl;

//	testForALCError(device);
//	testForALCError(device2);

    if(device==NULL) {
		std::cout << "cannot open sound card" << std::endl;
		return;
    }
};

// ------------------------------------------
NodeOpenALDevice::~NodeOpenALDevice() {
	if(device) {
		cout << "destroying device" << endl;
		alcCloseDevice(device);
	}
};

// ------------------------------------------
void NodeOpenALDevice::Init(Handle<Object> exports) {
	// Prepare constructor template
	Local<FunctionTemplate> tpl = FunctionTemplate::New(New);
	tpl->SetClassName(String::NewSymbol("Device"));
	tpl->InstanceTemplate()->SetInternalFieldCount(1);

	Persistent<Function> constructor = Persistent<Function>::New(tpl->GetFunction());
	exports->Set(String::NewSymbol("Device"), constructor);
}

// ------------------------------------------
Handle<Value> NodeOpenALDevice::New(const Arguments& args) {
	HandleScope scope;

	NodeOpenALDevice* obj = new NodeOpenALDevice();
	//devices.push_back( obj );
	obj->Wrap( args.This() );

	return args.This();
}
