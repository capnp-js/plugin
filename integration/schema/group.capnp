@0x8837f94efa34b445;

struct S(A,B) {
  a :group {
    uint8 @0 :UInt8;
    paramA @1 :A;
  }
  b :group {
    int32 @2 :Int32;
    data @3 :Data;
  }
  c :union {
    f1 @4 :Int8;
    f2 @5 :Int8;
    d :union {
      f3 @6 :Int8;
      paramB @7 :B;
    }
  }
  union {
    g1 @8 :Int8;
    e :union {
      g2 @9 :Int8;
      paramB @10 :B;
    }
  }
}
