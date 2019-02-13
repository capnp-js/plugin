@0xe3a048f5756763dd;

struct Trivial {}

const a :Text = "a";
const b :Trivial = ();
const c :List(Text) = ["c"];

struct FirstNongeneric {
  struct FirstGeneric(A, B) {
    struct SecondNongeneric {
      struct SecondGeneric(X) {
        sg0 @0 :B;
        sg1 @1 :X;
      }
      interface J(Y) {
        struct Inner {}
        a @0 (j1 :Int16, j2 :Y, j3 :A) -> (r1 :Data, r2 :AnyPointer);
      }
      fg0 @0 :A;
    }
    defAnyS @0 :AnyStruct = .b;
    defAnyL @1 :AnyList = .c;
  }
  someAnyP @0 :AnyPointer;
  someAnyS @1 :AnyStruct;
  union {
    someAnyL @2 :AnyList;
    someNumber @3 :UInt32 = 12;
  }

  interface I {
    p @0 () -> (result: Trivial);
  }
}
