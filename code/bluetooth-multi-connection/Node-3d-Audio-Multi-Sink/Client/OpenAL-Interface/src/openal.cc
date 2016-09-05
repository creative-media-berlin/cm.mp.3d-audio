#include <node.h>
#include <v8.h>

#ifdef __APPLE__
	#include <OpenAL/al.h>
	#include <OpenAL/alc.h>
#endif

#if defined (_WIN32) || defined (_WIN64)
	#include <AL/al.h>
	#include <AL/alc.h>
#endif

#include "NodeWavData.h"
#include "NodeOpenALDevice.h"
#include "NodeOpenALContext.h"
#include "NodeOpenALSource.h"
#include "NodeOpenALStream.h"
//#include <sstream>

using namespace v8;
using namespace std;

//void CheckALError(const char* operation) {
//
//	ALenum alErr = alGetError();
//	if(alErr == AL_NO_ERROR) return;
//	std::stringstream ss;
//	switch(alErr){
//		case AL_INVALID_NAME:
//			ss << "OpenAL error: " << AL_INVALID_NAME;
//			break;
//		case AL_INVALID_VALUE:
//			ss << "OpenAL error: " << AL_INVALID_VALUE;
//			break;
//		case AL_INVALID_ENUM:
//			ss << "OpenAL error: " << AL_INVALID_ENUM;
//			break;
//		case AL_INVALID_OPERATION:
//			ss << "OpenAL error: " << AL_INVALID_OPERATION;
//			break;
//		case AL_OUT_OF_MEMORY:
//			ss << "OpenAL error: " << AL_OUT_OF_MEMORY;
//			break;
//	}
//
//	std::cout << ss << endl;
//}
//
//void testForALCError(ALCdevice *device) {
//  ALenum error;
//  error = alcGetError(device);
//  if (error != ALC_NO_ERROR)
//    printf("\nALC Error %x occurred: %s\n", error, alcGetString(device, error));
//}

void PrintOpenALInfo()
{
	if (alGetString(AL_VERSION))
		cout << "OpenAL version: "    << alGetString(AL_VERSION)    << endl;
	if (alGetString(AL_RENDERER))
		cout << "OpenAL renderer: "   << alGetString(AL_RENDERER)   << endl;
	if (alGetString(AL_VENDOR))
		cout << "OpenAL vendor: "     << alGetString(AL_VENDOR)     << endl;
	if (alGetString(AL_EXTENSIONS))
		cout << "OpenAL extensions: " << alGetString(AL_EXTENSIONS) << endl;

	// Enumerate OpenAL devices
	// ALC_ENUMERATION_EXT ==> ALC_ENUMERATION_EXT_ALL (not working on Mac)
	if (alcIsExtensionPresent (NULL, (const ALCchar *) "ALC_ENUMERATION_EXT") == AL_TRUE)
	{
		// ALC_DEVICE_SPECIFIER => ALC_ALL_DEVICES_SPECIFIER (not working on Mac)
		const char *s = (const char *) alcGetString(NULL, ALC_DEVICE_SPECIFIER);
//		const char *s = (const char *) alcGetString(NULL, ALC_ALL_DEVICES_SPECIFIER);


		while (*s != '\0')
		{
			cout << "OpenAL available device: " << s << endl;
			while (*s++ != '\0');
		}
	}
	else
	{
		cout << "OpenAL device enumeration isn't available." << endl;
	}

	// Print default device name
	cout << "OpenAL default device: "
	     << (const char *)alcGetString(NULL, ALC_DEFAULT_DEVICE_SPECIFIER)
		 << endl;

	// Print current device name
	// if (myDevice)
	// {
	// 	cout << "OpenAL current device: "
	// 		 << (const char *)alcGetString(myDevice, ALC_DEVICE_SPECIFIER)
	// 		 << endl;
	// }
}



// --------------------------------------------------
Handle<Value> SetListenerOrientation(const Arguments& args) {
	v8::HandleScope scope;
	double x = args[0]->NumberValue();
	double y = args[1]->NumberValue();
	double z = args[2]->NumberValue();
	float o[] = {x, y, z, 0, 1, 0};
	alListenerfv(AL_ORIENTATION, o);
	return scope.Close(v8::Undefined());
}

// --------------------------------------------------
Handle<Value> SetListenerPosition(const Arguments& args) {
	v8::HandleScope scope;
	double x = args[0]->NumberValue();
	double y = args[1]->NumberValue();
	double z = args[2]->NumberValue();
	float p[] = {x, y, z, 0, 1, 0};
	alListenerfv(AL_POSITION, p);
	return scope.Close(v8::Undefined());
}

// --------------------------------------------------
Handle<Value> MakeContextCurrent(const Arguments& args) {
	v8::HandleScope scope;

	if (args.Length() < 1) {
		ThrowException(Exception::TypeError(String::New("Wrong number of arguments")));
		return scope.Close( Undefined() );
	}

	if ( !args[0]->IsObject() ) {
		ThrowException(Exception::TypeError(String::New("Wrong arguments")));
		return scope.Close( Undefined() );
	}

	NodeOpenALContext* ctx = node::ObjectWrap::Unwrap<NodeOpenALContext>(args[0]->ToObject());
	alcMakeContextCurrent(ctx->context);

	return scope.Close(v8::Undefined());
}

// --------------------------------------------------
void Init(Handle<Object> exports) {
	PrintOpenALInfo();
	
	NodeWavData::Init(exports);
	NodeOpenALContext::Init(exports);
	NodeOpenALDevice::Init(exports);
	NodeOpenALSource::Init(exports);
	NodeOpenALStream::Init(exports);
	
	exports->Set( String::NewSymbol("MakeContextCurrent"), FunctionTemplate::New(MakeContextCurrent)->GetFunction() );
	exports->Set( String::NewSymbol("SetListenerPosition"), FunctionTemplate::New(SetListenerPosition)->GetFunction() );
	exports->Set( String::NewSymbol("SetListenerOrientation"), FunctionTemplate::New(SetListenerOrientation)->GetFunction() );
}


/**
*	Initialize
*/
NODE_MODULE(openal, Init)