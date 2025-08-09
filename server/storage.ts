import {
  users,
  vendors,
  menuItems,
  orders,
  drivers,
  type User,
  type UpsertUser,
  type Vendor,
  type InsertVendor,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type Driver,
  type InsertDriver,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Vendor operations
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByUserId(userId: string): Promise<Vendor | undefined>;
  getVendors(): Promise<Vendor[]>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor>;
  
  // Menu item operations
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  getMenuItems(vendorId: string): Promise<MenuItem[]>;
  updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  getOrdersByVendor(vendorId: string): Promise<Order[]>;
  getOrdersByDriver(driverId: string): Promise<Order[]>;
  getUnassignedOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string, driverId?: string): Promise<Order>;
  
  // Driver operations
  createDriver(driver: InsertDriver): Promise<Driver>;
  getDriver(id: string): Promise<Driver | undefined>;
  getDriverByUserId(userId: string): Promise<Driver | undefined>;
  getAvailableDrivers(): Promise<Driver[]>;
  updateDriverStatus(userId: string, isOnline: boolean): Promise<Driver>;
  
  // Analytics
  getSystemStats(): Promise<{
    totalUsers: number;
    activeVendors: number;
    activeDrivers: number;
    todayOrders: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Vendor operations
  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async getVendorByUserId(userId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.userId, userId));
    return vendor;
  }

  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.isActive, true));
  }

  async updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor> {
    const [updatedVendor] = await db
      .update(vendors)
      .set(vendor)
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  // Menu item operations
  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const [newMenuItem] = await db.insert(menuItems).values(menuItem).returning();
    return newMenuItem;
  }

  async getMenuItems(vendorId: string): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.vendorId, vendorId), eq(menuItems.isAvailable, true)));
  }

  async updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem> {
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set(menuItem)
      .where(eq(menuItems.id, id))
      .returning();
    return updatedMenuItem;
  }

  async deleteMenuItem(id: string): Promise<void> {
    await db.update(menuItems).set({ isAvailable: false }).where(eq(menuItems.id, id));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByVendor(vendorId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.vendorId, vendorId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersByDriver(driverId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.driverId, driverId))
      .orderBy(desc(orders.createdAt));
  }

  async getUnassignedOrders(): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.status, "ready"))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: string, status: string, driverId?: string): Promise<Order> {
    const updateData: any = { status, updatedAt: new Date() };
    if (driverId) {
      updateData.driverId = driverId;
    }
    
    const [updatedOrder] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  // Driver operations
  async createDriver(driver: InsertDriver): Promise<Driver> {
    const [newDriver] = await db.insert(drivers).values(driver).returning();
    return newDriver;
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getDriverByUserId(userId: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver;
  }

  async getAvailableDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.isOnline, true));
  }

  async updateDriverStatus(userId: string, isOnline: boolean): Promise<Driver> {
    const [updatedDriver] = await db
      .update(drivers)
      .set({ isOnline })
      .where(eq(drivers.userId, userId))
      .returning();
    return updatedDriver;
  }

  // Analytics
  async getSystemStats(): Promise<{
    totalUsers: number;
    activeVendors: number;
    activeDrivers: number;
    todayOrders: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeVendors] = await db.select({ count: count() }).from(vendors).where(eq(vendors.isActive, true));
    const [activeDrivers] = await db.select({ count: count() }).from(drivers).where(eq(drivers.isOnline, true));
    const [todayOrders] = await db.select({ count: count() }).from(orders).where(eq(orders.createdAt, today));

    return {
      totalUsers: totalUsers.count || 0,
      activeVendors: activeVendors.count || 0,
      activeDrivers: activeDrivers.count || 0,
      todayOrders: todayOrders.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
