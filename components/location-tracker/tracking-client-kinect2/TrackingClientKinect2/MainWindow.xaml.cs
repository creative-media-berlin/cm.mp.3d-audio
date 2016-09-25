using Microsoft.Kinect;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using WebSocketSharp;
using System.Globalization;

namespace TrackingClientKinect2
{
    public partial class MainWindow : Window
    {
        KinectSensor _sensor;
        MultiSourceFrameReader _reader;
        IList<Body> _bodies;
        CameraMode _mode = CameraMode.Color;

        static int kinectNo = 1;
        static string URL = "localhost";
        static WebSocket locationSocket = new WebSocket("ws://" + URL + ":8001/k" + kinectNo);
        static WebSocket footstepSocket = new WebSocket("ws://" + URL + ":8001/footstep");
        int frameCounter = 0; int bodyCounter = 0;
        Boolean leftFootLifted = false; Boolean rightFootLifted = false;
        List<double> leftFootDist = new List<double>();
        List<double> rightFootDist = new List<double>();

        public MainWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            _sensor = KinectSensor.GetDefault();

            if (_sensor != null)
            {
                locationSocket.ConnectAsync();
                locationSocket.OnOpen += (senderObject, eArgs) => footstepSocket.ConnectAsync();
                locationSocket.OnClose += (senderObject, eArgs) => locationSocket.ConnectAsync();
                footstepSocket.ConnectAsync();
                footstepSocket.OnOpen += (senderObject, eArgs) => Console.WriteLine("\n\n!! connection established !!\n");
                footstepSocket.OnClose += (senderObject, eArgs) => locationSocket.ConnectAsync();

                _sensor.Open();
                _reader = _sensor.OpenMultiSourceFrameReader(FrameSourceTypes.Color | FrameSourceTypes.Depth | FrameSourceTypes.Infrared | FrameSourceTypes.Body);
                _reader.MultiSourceFrameArrived += Reader_MultiSourceFrameArrived;
            }
        }

        private void Window_Closed(object sender, EventArgs e)
        {
            if (_reader != null)
            {
                _reader.Dispose();
            }

            if (_sensor != null)
            {
                _sensor.Close();

                Console.WriteLine("closing...");
                locationSocket.Close();
                footstepSocket.Close();
            }
        }

        void Reader_MultiSourceFrameArrived(object sender, MultiSourceFrameArrivedEventArgs e)
        {
            var reference = e.FrameReference.AcquireFrame();

            // Color
            using (var frame = reference.ColorFrameReference.AcquireFrame())
            {
                if (frame != null)
                {
                    if (_mode == CameraMode.Color)
                    {
                        camera.Source = frame.ToBitmap();
                    }
                }
            }

            // Depth
            using (var frame = reference.DepthFrameReference.AcquireFrame())
            {
                if (frame != null)
                {
                    if (_mode == CameraMode.Depth)
                    {
                        camera.Source = frame.ToBitmap();
                    }
                }
            }

            // Infrared
            using (var frame = reference.InfraredFrameReference.AcquireFrame())
            {
                if (frame != null)
                {
                    if (_mode == CameraMode.Infrared)
                    {
                        camera.Source = frame.ToBitmap();
                    }
                }
            }
            
            // Body
            using (var frame = reference.BodyFrameReference.AcquireFrame())
            {
                frameCounter++;
                if (frame != null)
                {
                    canvas.Children.Clear();

                    _bodies = new Body[frame.BodyFrameSource.BodyCount];

                    frame.GetAndRefreshBodyData(_bodies);

                    //if (_bodies.Contains())
                    //{
                    //    Console.WriteLine("no bodies tracked");
                    //}

                    List<string> players = new List<string>(); 

                    foreach (var body in _bodies)
                    {
                        if (body.IsTracked)
                        {
                            foreach (Joint joint in body.Joints.Values)
                            {
                                if (joint.TrackingState == TrackingState.Tracked)
                                {

                                    if (frameCounter >= 3)
                                    {
                                        //add 1-2 player to players array
                                        if (joint.JointType == JointType.SpineBase)
                                        {

                                            Console.WriteLine("{\"bodyId\":\"" + body.TrackingId.ToString() + "\""
                                                + ", x:" + joint.Position.X.ToString(new CultureInfo("en-us"))
                                                + ", y:" + joint.Position.Y.ToString(new CultureInfo("en-us"))
                                                + ", z:" + joint.Position.Z.ToString(new CultureInfo("en-us")) + "}"); 
                                            players.Add("{\"bodyId\":\"" + body.TrackingId.ToString() + "\""
                                                + ", \"x\":" + joint.Position.X.ToString(new CultureInfo("en-US"))
                                                + ", \"y\":" + joint.Position.Y.ToString(new CultureInfo("en-US"))
                                                + ", \"z\":" + joint.Position.Z.ToString(new CultureInfo("en-US")) + "}");
                                        }
                                    }
                                    if (joint.JointType == JointType.FootLeft)
                                    {
                                        double dist = frame.FloorClipPlane.X * joint.Position.X + frame.FloorClipPlane.Y * joint.Position.Y + frame.FloorClipPlane.Z * joint.Position.Z + frame.FloorClipPlane.W;
                                        leftFootDist.Add(dist);
      
                                    }
                                    if (joint.JointType == JointType.FootRight)
                                    {
                                        double dist = frame.FloorClipPlane.X * joint.Position.X + frame.FloorClipPlane.Y * joint.Position.Y + frame.FloorClipPlane.Z * joint.Position.Z + frame.FloorClipPlane.W;
                                        rightFootDist.Add(dist);
                                    }
                                    double liftThreshold = 0.07;
                                    if (leftFootDist.Count >= 10)
                                    {
                                        leftFootDist.Sort();
                                        leftFootDist.RemoveAt(9); leftFootDist.RemoveAt(8);
                                        leftFootDist.RemoveAt(1); leftFootDist.RemoveAt(0);
                                        double average = leftFootDist.Average();

                                        //Console.WriteLine(average);

                                        if (leftFootLifted && average < liftThreshold)
                                        {
                                            Console.WriteLine("Footstep Left!!!");
                                            leftFootLifted = false;
                                            footstepSocket.Send("{\"kinectNo\": \"kinect" + kinectNo + "\", \"bodyId\": " + body.TrackingId.ToString() 
                                                + ", \"footstep\": \"left\", \"x\": " + joint.Position.X.ToString(new CultureInfo("en-US")) + ", \"z\": " + joint.Position.Z.ToString(new CultureInfo("en-US")) + "}");
                                        }
                                        else if (average > liftThreshold)
                                        {
                                            leftFootLifted = true;
                                        }
                                        leftFootDist.Clear();
                                    }
                                    if (rightFootDist.Count >= 10)
                                    {
                                        rightFootDist.Sort();
                                        rightFootDist.RemoveAt(9); rightFootDist.RemoveAt(8);
                                        rightFootDist.RemoveAt(1); rightFootDist.RemoveAt(0);

                                        //Console.WriteLine(avarage);                                     

                                        if (rightFootLifted && rightFootDist.Average() < liftThreshold)
                                        {
                                            Console.WriteLine("Footstep Right!!!");
                                            rightFootLifted = false;
                                            footstepSocket.Send("{\"kinectNo\": \"kinect" + kinectNo + "\", \"bodyId\": " + body.TrackingId 
                                                + ", \"footstep\": \"right\", \"x\": " + joint.Position.X.ToString(new CultureInfo("en-US")) + ", \"z\": " + joint.Position.Z.ToString(new CultureInfo("en-US")) + "}");
                                        }
                                        else if (rightFootDist.Average() > liftThreshold)
                                        {
                                            rightFootLifted = true;
                                        }
                                        rightFootDist.Clear();
                                    }
          
                                    if (joint.JointType == JointType.Head)
                                    {
                                        var dist = frame.FloorClipPlane.X * joint.Position.X + frame.FloorClipPlane.Y * joint.Position.Y + frame.FloorClipPlane.Z * joint.Position.Z + frame.FloorClipPlane.W;
                                        //Console.WriteLine("Floor X: " + frame.FloorClipPlane.X); // print all floor values
                                        //Console.WriteLine("Distance Ground to Head: " + dist);
                                    }
                                    // 3D space point
                                    CameraSpacePoint jointPosition = joint.Position;

                                    // 2D space point
                                    Point point = new Point();

                                    if (_mode == CameraMode.Color)
                                    {
                                        ColorSpacePoint colorPoint = _sensor.CoordinateMapper.MapCameraPointToColorSpace(jointPosition);

                                        point.X = float.IsInfinity(colorPoint.X) ? 0 : colorPoint.X;
                                        point.Y = float.IsInfinity(colorPoint.Y) ? 0 : colorPoint.Y;
                                    }
                                    else if (_mode == CameraMode.Depth || _mode == CameraMode.Infrared) // Change the Image and Canvas dimensions to 512x424
                                    {
                                        DepthSpacePoint depthPoint = _sensor.CoordinateMapper.MapCameraPointToDepthSpace(jointPosition);

                                        point.X = float.IsInfinity(depthPoint.X) ? 0 : depthPoint.X;
                                        point.Y = float.IsInfinity(depthPoint.Y) ? 0 : depthPoint.Y;
                                    }

                                    // Draw
                                    Ellipse ellipse = new Ellipse
                                    {
                                        Fill = Brushes.Red,
                                        Width = 20,
                                        Height = 20
                                    };

                                    Canvas.SetLeft(ellipse, point.X - ellipse.Width / 2);
                                    Canvas.SetTop(ellipse, point.Y - ellipse.Height / 2);

                                    canvas.Children.Add(ellipse);
                                }
                            }
                        }
                    }

                    if (frameCounter >= 3)
                    {
                        // send players array to sever
                        frameCounter = 0;

                        if (players.Count == 1)
                        {
                            locationSocket.Send("{\"rawData1\": " + players.ElementAt(0) + " }");
                        }
                        if (players.Count == 2)
                        {
                            locationSocket.Send("{\"rawData1\": " + players.ElementAt(0) + ", \"rawData2\": " + players.ElementAt(1) + " }");
                        }
                        if (players.Count > 2)
                        {
                            locationSocket.Send("Too many players on playground");
                            Console.WriteLine("Too many players on playground");

                        }
                    }
                    
                }
            }   
        }
    }
    

    enum CameraMode
    {
        Color,
        Depth,
        Infrared
    }
}
