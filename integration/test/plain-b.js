/* @flow */

import * as assert from "assert";
import { describe, it } from "mocha";
import { Limited } from "@capnp-js/base-arena";
import { Builder } from "@capnp-js/builder-arena";
import { nonnull } from "@capnp-js/nullary";
import { inject as injectI64 } from "@capnp-js/int64";
import { inject as injectU64 } from "@capnp-js/uint64";
import { Leaves, MaybeLeaves, Lists, Nesteds } from "../plain.capnp-b";

describe("Leaves", function () {
  const arena = Builder.fresh(2000, new Limited(1<<26, 64));
  const leaves = arena.initRoot(Leaves);

  describe("void field", function () {
    it("gets value without errors", function () {
      assert.doesNotThrow(() => leaves.getVoid());
    });

    it("sets value without errors", function () {
      assert.doesNotThrow(() => leaves.setVoid());
    });
  });

  describe("bool field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(leaves.getBool(), true);
    });

    it("sets the field value", function () {
      it("exposes bool fields", function () {
        leaves.setBool(false);
        assert.equal(leaves.getBool(), false);
      });
    });
  })

  describe("uint8 field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(leaves.getUint8(), 253);
    });

    it("sets the field value", function () {
      leaves.setUint8(12);
      assert.equal(leaves.getUint8(), 12);
    });
  });

  describe("uint16 field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(leaves.getUint16(), 65531);
    });

    it("sets the field value", function () {
      leaves.setUint16(23000);
      assert.equal(leaves.getUint16(), 23000);
    });
  });

  describe("uint32 field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(leaves.getUint32(), 4294967123);
    });

    it("sets the field value", function () {
      leaves.setUint32(18374747);
      assert.equal(leaves.getUint32(), 18374747);
    });
  });

  describe("uint64 field", function () {
    it("gets the default field value if the field is not set", function () {
      const def = leaves.getUint64();
      assert.equal(def[0], 0xffffffff);
      assert.equal(def[1], 0xfffffff2);
    });

    it("sets the field value", function () {
      leaves.setUint64(injectU64(0x00942983, 0x01989383));
      const value = leaves.getUint64();
      assert.equal(value[0], 0x00942983);
      assert.equal(value[1], 0x01989383);
    });
  });

  describe("int8 field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(leaves.getInt8(), -119);
    });

    it("sets the field value", function () {
      leaves.setInt8(12);
      assert.equal(leaves.getInt8(), 12);
    });
  });

  describe("int16 field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(leaves.getInt16(), -32612);
    });

    it("sets the field value", function () {
      leaves.setInt16(-800);
      assert.equal(leaves.getInt16(), -800);
    });
  });

  describe("int32 field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(leaves.getInt32(), -2147483102);
    });

    it("sets the field value", function () {
      leaves.setInt32(-918733);
      assert.equal(leaves.getInt32(), -918733);
    });
  });

  describe("int64 field", function () {
    it("gets the default field value if the field is not set", function () {
      const def = leaves.getInt64();
      assert.equal(def[0], -0x80000000);
      assert.equal(def[1], 0x60);
    });

    it("sets the field value", function () {
      leaves.setInt64(injectI64(-0x01837400, 0x91737333));
      const value = leaves.getInt64();
      assert.equal(value[0], -0x01837400);
      assert.equal(value[1], 0x91737333);
    });
  });

  describe("float32 field", function () {
    it("gets the default field value if the field is not set", function () {
      const epsilon = Math.pow(2, -24);
      const v = -1923484748.1422;
      assert.ok(Math.abs(v - leaves.getFloat32()) < Math.abs(v*epsilon));
    });

    it("sets the field value", function () {
      const epsilon = Math.pow(2, -24);
      const v = 89.437462763762;
      leaves.setFloat32(v);
      assert.ok(Math.abs(v - leaves.getFloat32()) < Math.abs(v*epsilon));
    });
  });

  describe("float64 field", function () {
    it("gets the default field value if the field is not set", function () {
      const epsilon = Math.pow(2, -53);
      const v = -1909817719838772387192132987.12343;
      assert.ok(Math.abs(v - leaves.getFloat64()) < Math.abs(v*epsilon));
    });

    it("sets the field value", function () {
      const epsilon = Math.pow(2, -53);
      const v = -1947476828222.2742874928239892;
      leaves.setFloat64(v);
      assert.ok(Math.abs(v - leaves.getFloat64()) < Math.abs(v*epsilon));
    });
  });

  describe("data field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(nonnull(arena.getRoot()).getAs(MaybeLeaves).getData(), null);
      const def = leaves.getData().asBytes();
      assert.equal(def[0], 0x11);
      assert.equal(def[1], 0xab);
      assert.equal(def[2], 0x2e);
      assert.equal(def.length, 3);
      leaves.disownData();
    });

    it("gets the field value", function () {
      leaves.adoptData(arena.initData(2));
      assert.notEqual(nonnull(arena.getRoot()).getAs(MaybeLeaves).getData(), null);
      const data = leaves.getData().asBytes();
      data[0] = 0xfc;
      data[1] = 0x53;
      assert.equal(data[0], 0xfc);
      assert.equal(data[1], 0x53);
      assert.equal(data.length, 2);
      leaves.disownData();
    });

    it("disowns the default field value if the field is not set", function () {
      const maybes = nonnull(arena.getRoot()).getAs(MaybeLeaves);
      assert.equal(maybes.getData(), null);
      const orphan = leaves.disownData();
      assert.equal(maybes.getData(), null);
      leaves.adoptData(orphan);
      assert.notEqual(maybes.getData(), null);
      const data = leaves.getData().asBytes();
      assert.equal(data[0], 0x11);
      assert.equal(data[1], 0xab);
      assert.equal(data[2], 0x2e);
      assert.equal(data.length, 3);
      leaves.disownData();
    });

    it("disowns the field value", function () {
      const maybes = nonnull(arena.getRoot()).getAs(MaybeLeaves);
      assert.equal(maybes.getData(), null);
      leaves.adoptData(arena.initData(2));
      assert.notEqual(maybes.getData(), null);
      const orphan = leaves.disownData();
      assert.equal(maybes.getData(), null);
      leaves.adoptData(orphan);
      assert.notEqual(maybes.getData(), null);
      assert.equal(leaves.getData().asBytes().length, 2);
    });

    it("sets the field value", function () {
      leaves.adoptData(arena.initData(1));
      const value = leaves.getData();
      leaves.disownData();
      const maybes = nonnull(arena.getRoot()).getAs(MaybeLeaves);
      assert.equal(maybes.getData(), null);
      leaves.setData(value);
      assert.equal(leaves.getData().asBytes().length, 1);
      leaves.disownData();
    });

    it("adopts the field value", function () {
      leaves.adoptData(arena.initData(5));
      assert.equal(leaves.getData().asBytes().length, 5);
      leaves.disownData();
    });

    it("rejects attached orphans from adoption", function () {
      const orphan = arena.initData(4);
      assert.ok(orphan.isDetached());
      leaves.adoptData(orphan);
      assert.ok(!orphan.isDetached());
      assert.throws(() => leaves.adopt(orphan));
      leaves.disownData();
    });
  });

  describe("text field", function () {
    it("gets the default field value if the field is not set", function () {
      assert.equal(nonnull(arena.getRoot()).getAs(MaybeLeaves).getText(), null);
      assert.equal(leaves.getText().toString(), "some text");
      leaves.disownText();
    });

    it("gets the field value", function () {
      leaves.adoptText(arena.initText("new text"));
      assert.notEqual(nonnull(arena.getRoot()).getAs(MaybeLeaves).getText(), null);
      const text = leaves.getText().toString();
      assert.equal(text, "new text");
      leaves.disownText();
    });

    it("disowns the default field value if the field is not set", function () {
      const maybes = nonnull(arena.getRoot()).getAs(MaybeLeaves);
      assert.equal(maybes.getText(), null);
      const orphan = leaves.disownText();
      assert.equal(maybes.getText(), null);
      leaves.adoptText(orphan);
      assert.notEqual(maybes.getText(), null);
      const text = leaves.getText().toString();
      assert.equal(text, "some text");
      leaves.disownText();
    });

    it("disowns the field value", function () {
      const maybes = nonnull(arena.getRoot()).getAs(MaybeLeaves);
      assert.equal(maybes.getText(), null);
      leaves.adoptText(arena.initText("different text"));
      assert.notEqual(maybes.getText(), null);
      const orphan = leaves.disownText();
      assert.equal(maybes.getText(), null);
      leaves.adoptText(orphan);
      assert.notEqual(maybes.getText(), null);
      assert.equal(leaves.getText().toString(), "different text");
    });

    it("sets the field value", function () {
      leaves.adoptText(arena.initText("more text"));
      const value = leaves.getText();
      leaves.disownText();
      const maybes = nonnull(arena.getRoot()).getAs(MaybeLeaves);
      assert.equal(maybes.getText(), null);
      leaves.setText(value);
      assert.equal(leaves.getText().toString(), "more text");
      leaves.disownText();
    });

    it("adopts the field value", function () {
      leaves.adoptText(arena.initText("some string"));
      assert.equal(leaves.getText().toString(), "some string");
      leaves.disownText();
    });

    it("rejects attached orphans from adoption", function () {
      const orphan = arena.initText("yet another string");
      assert.ok(orphan.isDetached());
      leaves.adoptText(orphan);
      assert.ok(!orphan.isDetached());
      assert.throws(() => leaves.adopt(orphan));
      leaves.disownText();
    });
  });
});

describe("Lists", function () {
  const arena = Builder.fresh(2000, new Limited(1<<26, 64));
  const lists = arena.initRoot(Lists);
});

describe("Nesteds", function () {
  const arena = Builder.fresh(2000, new Limited(1<<26, 64));
  const nesteds = arena.initRoot(Nesteds);
});
