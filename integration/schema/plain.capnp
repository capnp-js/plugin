@0x9a476aab458f8e81;

struct Leaves {
  void @0 :Void = void;
  bool @1 :Bool = true;
  uint8 @2 :UInt8 = 253;
  uint16 @3 :UInt16 = 65531;
  uint32 @4 :UInt32 = 4294967123;
  uint64 @5 :UInt64 = 18446744073709551602;
  int8 @6 :Int8 = -119;
  int16 @7 :Int16 = -32612;
  int32 @8 :Int32 = -2147483102;
  int64 @9 :Int64 = -9223372036854775712;
  float32 @10 :Float32 = -1923484748.1422;
  float64 @11 :Float64 = -1909817719838772387192132987.12343;
  data @12 :Data = 0x"11 ab 2e";
  text @13 :Text = "some text";
}

struct MaybeLeaves {
  void @0 :Void;
  bool @1 :Bool;
  uint8 @2 :UInt8;
  uint16 @3 :UInt16;
  uint32 @4 :UInt32;
  uint64 @5 :UInt64;
  int8 @6 :Int8;
  int16 @7 :Int16;
  int32 @8 :Int32;
  int64 @9 :Int64;
  float32 @10 :Float32;
  float64 @11 :Float64;
  data @12 :Data;
  text @13 :Text;
}

struct Lists {
  voidList @0 :List(Void) = [void, void];
  boolList @1 :List(Bool) = [false, true, false];
  uint8List @2 :List(UInt8) = [245, 3];
  uint16List @3 :List(UInt16) = [65413];
  uint32List @4 :List(UInt32) = [4294967012];
  uint64List @5 :List(UInt64) = [18446744073709551102];
  int8List @6 :List(Int8) = [-120];
  int16List @7 :List(Int16) = [-32425];
  int32List @8 :List(Int32) = [-2147483023];
  int64List @9 :List(Int64) = [-9223372036854775355];
  float32List @10 :List(Float32) = [-1923292748.1422];
  float64List @11 :List(Float64) = [-3409893459838772389222132987.12343];
  dataList @12 :List(Data) = [0x"00 aa bb"];
  textList @13 :List(Text) = ["text 0", "text 1"];
}

struct MaybeLists {
  voidList @0 :List(Void);
  boolList @1 :List(Bool);
  uint8List @2 :List(UInt8);
  uint16List @3 :List(UInt16);
  uint32List @4 :List(UInt32);
  uint64List @5 :List(UInt64);
  int8List @6 :List(Int8);
  int16List @7 :List(Int16);
  int32List @8 :List(Int32);
  int64List @9 :List(Int64);
  float32List @10 :List(Float32);
  float64List @11 :List(Float64);
  dataList @12 :List(Data);
  textList @13 :List(Text);
}

struct Nesteds {
  leaves @0 :Leaves = (bool = true, uint32 = 12, text = "different text");
  leavesList @1 :List(Leaves) = [(bool = true)];
  leavesListList @2 :List(List(Leaves)) = [[(uint16 = 28545)]];
  lists @3 :Lists = (uint8List = []);
  listsList @4 :List(Lists) = [(int16List = [])];
  listsListList @5 :List(List(Lists)) = [[(int8List = [1, 120])]];
}

struct MaybeNesteds {
  leaves @0 :Leaves;
  leavesList @1 :List(Leaves);
  leavesListList @2 :List(List(Leaves));
  lists @3 :Lists;
  listsList @4 :List(Lists);
  listsListList @5 :List(List(Lists));
}
